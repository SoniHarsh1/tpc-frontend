import { useState, useEffect } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { DataRibbon } from "./data-ribbon";
import { ChartSection } from "./chart-section";
import { SeasonDataFC } from "@/helpers/analytics-dashboard/types";
import { getSeasonStats } from "@/helpers/analytics-dashboard/api";
import Loading from "../common/loading";
import Loader from "../Loader/loader";
import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

function validateSeasonData(data: SeasonDataFC): boolean {
  if (!data) return false;

  const fieldsToCheck = [
    data.overallStats,
    data.departmentWiseStats,
    data.categoryWiseStats,
    data.genderWiseStats,
    data.courseWiseStats,
  ];

  for (const field of fieldsToCheck) {
    if (!field || Object.keys(field).length === 0) {
      return false;
    }
  }

  return true;
}

export default function Dashboard() {
  const [currentView, setCurrentView] = useState<"reports" | "trends">(
    "reports",
  );
  const [season, setSeason] = useState<string>("");
  const [seasonType, setSeasonType] = useState<string>("");
  const [yearRange, setYearRange] = useState<[number, number]>([
    new Date().getFullYear() - 5,
    new Date().getFullYear(),
  ]);
  const [seasonData, setSeasonData] = useState<SeasonDataFC | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [optionsx, setOptionsx] = useState([]);
  let options: any = [];
  useEffect(() => {
    axios
      .get(`${baseUrl}/api/v1/jaf`)
      .then((res) => {
        const newOptions = res.data.seasons.map((season: any) => {
          const seasonString = `${season.type} ${season.year}`;
          return {
            value: season.id,
            label: seasonString,
            type: season.type,
            year: season.year,
          };
        });

        // Sort the options
        newOptions.sort((a: any, b: any) => {
          if (a.year !== b.year) {
            return b.year - a.year;
          }
          if (a.type === b.type) {
            return 0;
          }
          return a.type === "Placement" ? -1 : 1;
        });

        setOptionsx(newOptions);
        if (newOptions.length > 0) {
          setSeason(newOptions[0].value);
          setSeasonType(newOptions[0].type);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  useEffect(() => {
    async function fetchSeasonData() {
      setIsLoading(true);
      try {
        let data = await getSeasonStats(season);
        if (data === null || !validateSeasonData(data)) {
          setError("Unable to fetch the data");
        } else {
          setSeasonData(data);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load season data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    if (season !== "" && seasonType !== "") {
      fetchSeasonData();
    }
  }, [season]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  while (seasonData === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        data={seasonData}
      />
      <div className="flex flex-col lg:flex-row min-h-screen overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto p-3 md:p-6 no-scrollbar order-2 lg:order-1">
          <DataRibbon stats={seasonData} seasonType={seasonType} />
          <ChartSection stats={seasonData} seasonType={seasonType} />
        </main>
        <div className="order-1 lg:order-2">
          <Sidebar
            view={currentView}
            season={season}
            seasonType={seasonType}
            setSeason={setSeason}
            setSeasonType={setSeasonType}
            options={optionsx}
            setYearRange={setYearRange}
            yearRange={yearRange}
          />
        </div>
      </div>
    </div>
  );
}
