"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardChartsProps {
  quizId: string;
}

export function DashboardCharts({ quizId }: DashboardChartsProps) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/dashboard/${quizId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, [quizId]);

  if (!data) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-64 flex items-center justify-center text-muted-foreground">Loading...</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const answerDist = data.answerDistribution || {};
  const scoreDist = data.scoreDistribution || {};
  const predictions = data.predictions || {};

  const predCounts = Object.values(predictions).reduce(
    (acc: { wellPrepared: number; lessPrepared: number }, p: any) => {
      if (p === "Well Prepared") acc.wellPrepared++;
      else acc.lessPrepared++;
      return acc;
    },
    { wellPrepared: 0, lessPrepared: 0 }
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Answer Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar
              data={{
                labels: Object.keys(answerDist),
                datasets: [{ label: "Respondents", data: Object.values(answerDist), backgroundColor: "hsl(221, 83%, 53%, 0.2)", borderColor: "hsl(221, 83%, 53%)", borderWidth: 1 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { maxRotation: 90, minRotation: 90 } } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar
              data={{
                labels: Object.keys(scoreDist).map((k) => `${k}-${Number(k) + 9}%`),
                datasets: [{ label: "Respondents", data: Object.values(scoreDist), backgroundColor: "hsl(173, 58%, 39%, 0.2)", borderColor: "hsl(173, 58%, 39%)", borderWidth: 1 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm">Prediction Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Bar
              data={{
                labels: ["Well Prepared", "Less Prepared"],
                datasets: [{ label: "Respondents", data: [predCounts.wellPrepared, predCounts.lessPrepared], backgroundColor: ["hsl(173, 58%, 39%, 0.2)", "hsl(0, 84%, 60%, 0.2)"], borderColor: ["hsl(173, 58%, 39%)", "hsl(0, 84%, 60%)"], borderWidth: 1 }],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
