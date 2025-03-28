'use client'

import { Bar, BarChart,  Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AcademicStats {
  totalRegisteredStudentsCount: number
  placedStudentsCount: number
  placementPercentage: number
  unplacedPercentage: number
  highestPackage: number
  lowestPackage: number
  meanPackage: number
  medianPackage: number
  modePackage: number
  totalOffers: number
  totalCompaniesOffering: number
}

interface AcademicWiseStats {
  [key: string]: AcademicStats
}

interface OffersByAcademicsProps {
  viewType: 'chart' | 'table'
  data: AcademicWiseStats
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const stats = payload[0].payload.stats;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <h3 className="font-bold">{`CPI : ${label}`}</h3>
        <p>Total Registered Students: {stats.totalRegisteredStudentsCount}</p>
        <p>Placed Students: {stats.placedStudentsCount}</p>
        <p>Placement %: {stats.placementPercentage.toFixed(2)}%</p>
        <p>Unplaced %: {stats.unplacedPercentage.toFixed(2)}%</p>
        <p>Highest Package: ₹{stats.highestPackage.toFixed(2)}L</p>
        <p>Lowest Package: ₹{stats.lowestPackage.toFixed(2)}L</p>
        <p>Mean Package: ₹{stats.meanPackage.toFixed(2)}L</p>
        <p>Median Package: ₹{stats.medianPackage.toFixed(2)}L</p>
        <p>Mode Package: ₹{stats.modePackage.toFixed(2)}L</p>
        <p>Total Offers: {stats.totalOffers}</p>
        <p>Total Companies Offering: {stats.totalCompaniesOffering}</p>
      </div>
    );
  }
  return null;
};

export function OffersByAcademics({ viewType, data = {} }: OffersByAcademicsProps) {
  const transformedData = Object.entries(data).map(([cpi, stats]) => ({
    cpi,
    placementPercentage: stats.placementPercentage,
    stats
  }));

  if (viewType === 'table') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Total Students</TableHead>
            <TableHead>Placed Students</TableHead>
            <TableHead>Placement %</TableHead>
            <TableHead>Unplaced %</TableHead>
            <TableHead>Highest Package (₹L)</TableHead>
            <TableHead>Lowest Package (₹L)</TableHead>
            <TableHead>Mean Package (₹L)</TableHead>
            <TableHead>Median Package (₹L)</TableHead>
            <TableHead>Mode Package (₹L)</TableHead>
            <TableHead>Total Offers</TableHead>
            <TableHead>Companies Offering</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([course, stats]) => (
            <TableRow key={course}>
              <TableCell>{course}</TableCell>
              <TableCell>{stats.totalRegisteredStudentsCount}</TableCell>
              <TableCell>{stats.placedStudentsCount}</TableCell>
              <TableCell>{stats.placementPercentage.toFixed(2)}%</TableCell>
              <TableCell>{stats.unplacedPercentage.toFixed(2)}%</TableCell>
              <TableCell>{stats.highestPackage.toFixed(2)}</TableCell>
              <TableCell>{stats.lowestPackage.toFixed(2)}</TableCell>
              <TableCell>{stats.meanPackage.toFixed(2)}</TableCell>
              <TableCell>{stats.medianPackage.toFixed(2)}</TableCell>
              <TableCell>{stats.modePackage.toFixed(2)}</TableCell>
              <TableCell>{stats.totalOffers}</TableCell>
              <TableCell>{stats.totalCompaniesOffering}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart 
        data={transformedData}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="cpi" 
          interval={0}
          angle={-45}
          textAnchor="end"
          height={100}
          tick={{
            dx: -8,
            dy: 10,
            fontSize: 12
          }}
        />
        <YAxis 
          label={{ 
            value: 'Placement %', 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle' }
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="placementPercentage" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

