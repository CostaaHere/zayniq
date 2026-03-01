import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Copy, Check, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TSEScoredTitle } from "@/types/titleIntelligence";

interface TSEScoreTableProps {
  titles: TSEScoredTitle[];
  onCopy: (title: string) => void;
  copiedTitle: string | null;
}

const getScoreColor = (score: number) => {
  if (score >= 8) return "text-green-500";
  if (score >= 6) return "text-yellow-500";
  return "text-orange-500";
};

const getTotalGrade = (total: number) => {
  if (total >= 45) return { grade: "S", color: "bg-green-500 text-white" };
  if (total >= 40) return { grade: "A", color: "bg-green-500/80 text-white" };
  if (total >= 35) return { grade: "B", color: "bg-yellow-500 text-white" };
  if (total >= 30) return { grade: "C", color: "bg-orange-500 text-white" };
  return { grade: "D", color: "bg-destructive text-white" };
};

const TSEScoreTable: React.FC<TSEScoreTableProps> = ({ titles, onCopy, copiedTitle }) => {
  const sorted = [...titles].sort((a, b) => b.scores.total - a.scores.total);

  return (
    <Card className="bg-card border-border border-l-4 border-l-violet-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-500/10">
            <BarChart3 className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Title Score Table</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              10 elite titles scored across 5 dimensions (max 50)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8">#</TableHead>
                <TableHead className="min-w-[250px]">Title</TableHead>
                <TableHead className="text-center w-16">CUR</TableHead>
                <TableHead className="text-center w-16">CLR</TableHead>
                <TableHead className="text-center w-16">EMO</TableHead>
                <TableHead className="text-center w-16">CMP</TableHead>
                <TableHead className="text-center w-16">INT</TableHead>
                <TableHead className="text-center w-20">Total</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((item, idx) => {
                const { grade, color } = getTotalGrade(item.scores.total);
                const isCopied = copiedTitle === item.title;
                return (
                  <TableRow key={idx} className={cn(idx === 0 && "bg-primary/5")}>
                    <TableCell className="font-medium text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-sm leading-snug">{item.title}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">{item.characterCount} ch</Badge>
                          <span className="text-[10px] text-muted-foreground">{item.emotionalDriver}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-center font-semibold", getScoreColor(item.scores.curiosityStrength))}>
                      {item.scores.curiosityStrength}
                    </TableCell>
                    <TableCell className={cn("text-center font-semibold", getScoreColor(item.scores.clarity))}>
                      {item.scores.clarity}
                    </TableCell>
                    <TableCell className={cn("text-center font-semibold", getScoreColor(item.scores.emotionalPull))}>
                      {item.scores.emotionalPull}
                    </TableCell>
                    <TableCell className={cn("text-center font-semibold", getScoreColor(item.scores.competitiveAdvantage))}>
                      {item.scores.competitiveAdvantage}
                    </TableCell>
                    <TableCell className={cn("text-center font-semibold", getScoreColor(item.scores.intentMatch))}>
                      {item.scores.intentMatch}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("text-xs font-bold", color)}>
                        {grade} ({item.scores.total})
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onCopy(item.title)}>
                        {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
          <span>CUR = Curiosity</span>
          <span>CLR = Clarity</span>
          <span>EMO = Emotional Pull</span>
          <span>CMP = Competitive Advantage</span>
          <span>INT = Intent Match</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default TSEScoreTable;
