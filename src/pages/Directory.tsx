import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Mail, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { fetchDirectory } from "@/lib/board-api";

export default function Directory() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["board-directory"],
    queryFn: fetchDirectory,
  });
  const directors = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Directory</h1>
        <p className="text-sm text-muted-foreground">
          Contact details and committee memberships for every active director on
          this board.
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Director</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Committees</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Term expires</TableHead>
                  <TableHead className="text-right">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      Loading directory…
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && directors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-8 text-center text-sm text-muted-foreground"
                    >
                      No other directors found yet.
                    </TableCell>
                  </TableRow>
                )}
                {directors.map((d) => (
                  <TableRow
                    key={d.id}
                    className={cn(d.isYou && "bg-primary/5")}
                  >
                    <TableCell className="whitespace-nowrap font-semibold">
                      <span className="flex items-center gap-2">
                        {d.name}
                        {d.isYou && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                            You
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {d.role}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {d.committees.length > 0 ? d.committees.join(", ") : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a
                        href={`mailto:${d.email}`}
                        className="flex items-center gap-1.5 text-primary hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" /> {d.email}
                      </a>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">
                      {d.termEnds
                        ? new Date(d.termEnds).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!d.isYou && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/messages?with=${d.id}`)}
                        >
                          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                          Message
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
