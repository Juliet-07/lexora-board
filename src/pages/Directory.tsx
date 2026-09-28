import { useNavigate } from "react-router-dom";
import { Mail, Phone, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { companySecretary, directoryRows } from "@/data/directoryMockData";

export default function Directory() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Board Directory</h1>
        <p className="text-sm text-muted-foreground">Contact details and committee memberships for all directors, and the Company Secretary.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="min-w-[720px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Director</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Committees</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Term expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directoryRows.map((d) => (
                  <TableRow key={d.id} className={cn(d.isYou && "bg-primary/5")}>
                    <TableCell className="whitespace-nowrap font-semibold">
                      <span className="flex items-center gap-2">
                        {d.name}
                        {d.isYou && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">You</Badge>}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{d.designation}</TableCell>
                    <TableCell className="text-muted-foreground">{d.committees}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <a href={`mailto:${d.email}`} className="text-primary hover:underline">{d.email}</a>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{d.termExpires}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Company Secretary</p>
            <p className="mt-1 text-sm font-bold">{companySecretary.name}</p>
            <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {companySecretary.email}</p>
              <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {companySecretary.phone}</p>
            </div>
          </div>
          <Button onClick={() => navigate("/messages")}>
            <Send className="mr-1.5 h-4 w-4" /> Send message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
