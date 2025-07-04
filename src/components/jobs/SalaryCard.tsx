"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Resume, Salary } from "@/helpers/student/types";
import { ApplyJob, GetSalaryById, OpenResume } from "@/helpers/student/api";
import { Button } from "../ui/button";
import toast from "react-hot-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import Link from "next/link";
import Loader from "@/components/Loader/loader";
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const url = (NextUrl: string) => {
  return `${baseUrl}/api/v1${NextUrl}`;
};

interface Props {
  salaryId: string;
  seasonType: string;
  resumes: Resume[];
}

export default function SalaryCard({ salaryId, resumes, seasonType }: Props) {
  const [salaryData, setSalaryData] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSalaryData = async () => {
    try {
      const data = await GetSalaryById(salaryId);
      setSalaryData(data);
    } catch (error) {
      toast.error("Error fetching data:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (salaryData === null) {
      fetchSalaryData();
    }
  });

  const [selectedResume, setSelectedResume] = useState<string | null>(null);

  const handleResumeChange = (value: string) => {
    setSelectedResume(value);
  };

  const handleApply = async () => {
   

    if (!selectedResume) {
      toast.error("Please select a resume");
      return;
    }

    const selectedResumeData = resumes.find(
      (resume) => resume.id === selectedResume,
    );
    if (!selectedResumeData) {
      toast.error("Selected resume not found");
      return;
    }

    console.log("Selected resume data:", selectedResumeData);

    try {
      const data = await ApplyJob(salaryId, selectedResume);
      if (data) {
        toast.success("Applied Successfully");
        fetchSalaryData();
      } else {
        toast.error("Cannot Apply");
      }
    } catch (error) {
      console.error("Application error:", error);
      if (error.message && error.message.includes("Not Authorized")) {
        toast.error(
          "You are not authorized to apply for this position. Please check if you meet the eligibility criteria.",
        );
      } else {
        toast.error("Failed to apply. Please try again or contact support.");
      }
    }
  };

  const handleOpenResume = async (filename: string) => {
    OpenResume(filename);
  };

  const [isopen, setIsopen] = useState(false);
  const handleViewDetails = () => {
    setIsopen(!isopen);
  };

  function formatNumber(num: number): string {
    console.log(num);
    if (num >= 1e7) {
      const crores = num / 1e7;
      return `₹${crores.toFixed(2)} Crores`;
    } else if (num >= 1e5) {
      const lakhs = num / 1e5;
      return `₹${lakhs.toFixed(2)} Lakhs`;
    } else if (num >= 1e3) {
      const lakhs = num / 1e3;
      return `₹${lakhs.toFixed(2)}K`;
    } else {
      return `₹${num.toString()}`;
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });
  }

  return (
    <div id="main-container" className="">
      {loading && (
        <div className="h-screen w-full flex justify-center items-center">
          <Loader />
        </div>
      )}
      {salaryData && (
        <div className="bg-white text-black p-5 rounded-xl">
          <div
            className="font-semibold text-md"
            onClick={handleViewDetails}
            style={{ cursor: "pointer" }}
          >
            <div className="flex justify-between">
              {salaryData?.job.company.name}
              {salaryData.job.applications.length > 0 && (
                <>
                  <div className=" text-green-500 font-semibold px-2 py-1 border rounded-3xl inline-block border-green-500 text-xs ">
                    {"Applied"}
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="">
            <div className="text-gray-500 font-semibold my-2 text-sm">
              {seasonType === "PLACEMENT"
                ? `CTC Offered: ${formatNumber(salaryData?.totalCTC)}`
                : `Stipend: ${formatNumber(salaryData?.stipend)}`}
            </div>
          </div>

          <div className="my-4">
            <Separator />
          </div>

          {seasonType === "PLACEMENT" ? (
            <>
              <div
                className="grid md:grid-cols-3 lg:grid-cols-6 text-sm mx-2"
                onClick={handleViewDetails}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="text-gray-500 font-semibold my-2 pr-2">
                    Role
                  </div>
                  <div className="">{salaryData?.job.role}</div>
                </div>
                <div className="md:ml-2 lg:ml-6">
                  <div className="text-gray-500 font-semibold my-2">
                    Base Salary
                  </div>
                  <div>
                    {salaryData?.baseSalary
                      ? formatNumber(salaryData?.baseSalary)
                      : ""}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Take Home Salary
                  </div>
                  <div>
                    {salaryData?.takeHomeSalary
                      ? formatNumber(salaryData?.takeHomeSalary)
                      : ""}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Gross Salary
                  </div>
                  <div>
                    {salaryData?.grossSalary
                      ? formatNumber(salaryData?.grossSalary)
                      : ""}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Other Compensations
                  </div>
                  <div>
                    {salaryData?.otherCompensations
                      ? formatNumber(salaryData?.otherCompensations)
                      : ""}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Duration
                  </div>
                  <div>{salaryData?.salaryPeriod || ""}</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className="grid md:grid-cols-3 lg:grid-cols-6 text-sm mx-2"
                onClick={handleViewDetails}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <div className="text-gray-500 font-semibold my-2 pr-2">
                    Role
                  </div>
                  <div>{salaryData?.job.role || ""}</div>
                </div>
                <div className="md:ml-2 lg:ml-6">
                  <div className="text-gray-500 font-semibold my-2">
                    Foreign Currency Stipend
                  </div>
                  <div>{salaryData?.foreignCurrencyStipend || ""}</div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Accommodation
                  </div>
                  <div>{salaryData?.accommodation ? "Yes" : "No"}</div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    PPO Provision
                  </div>
                  <div>
                    {salaryData?.ppoProvisionOnPerformance ? "Yes" : "No"}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Tentative CTC for PPO Select
                  </div>
                  <div>
                    {salaryData?.tentativeCTC
                      ? formatNumber(salaryData?.tentativeCTC)
                      : ""}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    PPO Confirmation Date
                  </div>
                  <div>
                    {salaryData?.PPOConfirmationDate
                      ? formatDate(salaryData?.PPOConfirmationDate)
                      : ""}
                  </div>
                </div>
                <div className="">
                  <div className="text-gray-500 font-semibold my-2">
                    Duration
                  </div>
                  <div>{salaryData?.salaryPeriod || ""}</div>
                </div>
              </div>
            </>
          )}

          {isopen && (
            <>
              <div className="my-4">
                <Separator />
              </div>
              {seasonType === "PLACEMENT" && (
                <>
                  <div
                    className="grid md:grid-cols-3 lg:grid-cols-4 text-sm mx-2"
                    onClick={handleViewDetails}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <div className="text-gray-500 font-semibold my-2 pr-2">
                        Joining Bonus
                      </div>
                      <div>
                        {salaryData?.joiningBonus
                          ? formatNumber(salaryData?.joiningBonus)
                          : ""}
                      </div>
                    </div>
                    <div className="md:ml-2 lg:ml-6">
                      <div className="text-gray-500 font-semibold my-2">
                        Performance Bonus
                      </div>
                      <div>
                        {salaryData?.performanceBonus
                          ? formatNumber(salaryData?.performanceBonus)
                          : ""}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-gray-500 font-semibold my-2">
                        Relocation
                      </div>
                      <div>
                        {salaryData?.relocation
                          ? formatNumber(salaryData?.relocation)
                          : ""}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-gray-500 font-semibold my-2">
                        Bond Amount
                      </div>
                      <div>
                        {salaryData?.bondAmount
                          ? formatNumber(salaryData?.bondAmount)
                          : ""}
                      </div>
                    </div>
                  </div>

                  <div className="my-4">
                    <Separator />
                  </div>

                  <div
                    className="grid md:grid-cols-3 lg:grid-cols-4 text-sm mx-2"
                    onClick={handleViewDetails}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <div className="text-gray-500 font-semibold my-2 pr-2">
                        ESOP Amount
                      </div>
                      <div>
                        {salaryData?.esopAmount
                          ? formatNumber(salaryData?.esopAmount)
                          : ""}
                      </div>
                    </div>
                    <div className="md:ml-2 lg:ml-6">
                      <div className="text-gray-500 font-semibold my-2">
                        ESOP Vest Period
                      </div>
                      <div>{salaryData?.esopVestPeriod || ""}</div>
                    </div>
                    <div className="">
                      <div className="text-gray-500 font-semibold my-2">
                        First Year CTC
                      </div>
                      <div>
                        {salaryData?.firstYearCTC
                          ? formatNumber(salaryData?.firstYearCTC)
                          : ""}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-gray-500 font-semibold my-2">
                        Retention Bonus
                      </div>
                      <div>
                        {salaryData?.retentionBonus
                          ? formatNumber(salaryData?.retentionBonus)
                          : ""}
                      </div>
                    </div>
                  </div>

                  <div className="my-4">
                    <Separator />
                  </div>

                  <div
                    className="grid md:grid-cols-3 lg:grid-cols-4 text-sm mx-2"
                    onClick={handleViewDetails}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <div className="text-gray-500 font-semibold my-2 pr-2">
                        Deductions
                      </div>
                      <div>
                        {salaryData?.deductions
                          ? formatNumber(salaryData?.deductions)
                          : ""}
                      </div>
                    </div>
                    <div className="md:ml-2 lg:ml-6">
                      <div className="text-gray-500 font-semibold my-2">
                        Medical Allowance
                      </div>
                      <div>
                        {salaryData?.medicalAllowance
                          ? formatNumber(salaryData?.medicalAllowance)
                          : ""}
                      </div>
                    </div>
                    <div className="">
                      <div className="text-gray-500 font-semibold my-2">
                        Bond Duration
                      </div>
                      <div>{salaryData?.bondDuration || ""}</div>
                    </div>
                    <div className="">
                      <div className="text-gray-500 font-semibold my-2">
                        Retention Bonus
                      </div>
                      <div>{`${salaryData?.foreignCurrencyCTC || ""} ${salaryData?.foreignCurrencyCode || ""}`}</div>
                    </div>
                  </div>

                  <div className="my-4">
                    <Separator />
                  </div>
                </>
              )}
              <div className="my-4 mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 text-sm mx-2">
                  <div>
                    <div className="text-gray-500 font-semibold my-2">
                      Selection mode
                    </div>{" "}
                    <div>{salaryData.job.selectionProcedure.selectionMode}</div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-semibold my-2">
                      Shortlist from Resume
                    </div>{" "}
                    <div>
                      {salaryData.job.selectionProcedure.shortlistFromResume
                        ? "YES"
                        : "NO"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 font-semibold my-2">
                      Group Discussion
                    </div>{" "}
                    <div>
                      {salaryData.job.selectionProcedure.groupDiscussion
                        ? "YES"
                        : "NO"}
                    </div>
                  </div>
                </div>
                <div className="my-4">
                  <Separator />
                </div>
                <div className="font-semibold text-md mx-2 my-2">
                  Selection Procedure
                </div>
                <h2 className="text-md font-semibold mx-2 mt-8">Tests</h2>
                <Table className="overflow-hidden">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryData.job.selectionProcedure.tests.map(
                      (test, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{test.type}</TableCell>
                          <TableCell>{test.duration}</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
                <h2 className="text-md font-semibold mx-2 mt-8">Interviews</h2>
                <Table className="overflow-hidden">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sr.</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryData.job.selectionProcedure.interviews.map(
                      (test, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{test.type}</TableCell>
                          <TableCell>{test.duration}</TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="my-4">
                <Separator />
              </div>

              <div className="font-semibold text-md mx-2 my-2">Events</div>
              <Table className="overflow-hidden">
                <TableHeader>
                  <TableRow>
                    <TableHead>Round</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaryData.job.events.map((event, index) => (
                    <TableRow key={index}>
                      <TableCell>{event.roundNumber}</TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell>{event.startDateTime}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {salaryData.job.applications.length > 0 && (
                <>
                  <div className="my-4">
                    <Separator />
                  </div>

                  <div className="font-semibold text-md mx-2 my-2">
                    Applications
                  </div>
                  <Table className="overflow-hidden">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sr.</TableHead>
                        <TableHead>Resume</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryData.job.applications.map((application, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div
                              className="my-1 p-2 text-blue-500 font-semibold cursor-pointer hover:text-blue-600 transition-all fade-in-out"
                              onClick={() =>
                                handleOpenResume(application.resume.filepath)
                              }
                            >
                              {application.resume.filepath}
                            </div>
                          </TableCell>
                          <TableCell>
                            {application.resume.verified
                              ? "Verified"
                              : "Not Verified"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              )}

              <div className="flex justify-between my-3">
                <Button disabled={!selectedResume} onClick={handleApply}>
                  Apply
                </Button>
                <Select
                  value={selectedResume || ""}
                  onValueChange={handleResumeChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Resume" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {resumes &&
                        resumes.map((resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.verified ? (
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {resume.name}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  x="0px"
                                  y="0px"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  style={{ fill: "#40C057", marginLeft: 5 }}
                                >
                                  <path d="M 12 2 C 6.486 2 2 6.486 2 12 C 2 17.514 6.486 22 12 22 C 17.514 22 22 17.514 22 12 C 22 10.874 21.803984 9.7942031 21.458984 8.7832031 L 19.839844 10.402344 C 19.944844 10.918344 20 11.453 20 12 C 20 16.411 16.411 20 12 20 C 7.589 20 4 16.411 4 12 C 4 7.589 7.589 4 12 4 C 13.633 4 15.151922 4.4938906 16.419922 5.3378906 L 17.851562 3.90625 C 16.203562 2.71225 14.185 2 12 2 z M 21.292969 3.2929688 L 11 13.585938 L 7.7070312 10.292969 L 6.2929688 11.707031 L 11 16.414062 L 22.707031 4.7070312 L 21.292969 3.2929688 z"></path>
                                </svg>
                              </span>
                            ) : (
                              resume.name
                            )}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
