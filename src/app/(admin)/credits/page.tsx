import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const ledgerEntries = [
    { id: 'TXN1001', userId: 'user1', reason: 'Initial Top-up', debit: 0, credit: 500, createdAt: new Date() },
    { id: 'TXN1002', userId: 'user1', reason: 'Render Job #RND-8219', debit: 1, credit: 0, createdAt: new Date() },
    { id: 'TXN1003', userId: 'user2', reason: 'Initial Top-up', debit: 0, credit: 100, createdAt: new Date() },
    { id: 'TXN1004', userId: 'user1', reason: 'Refund for failed Job #RND-8210', debit: 0, credit: 1, createdAt: new Date() },
    { id: 'TXN1005', userId: 'user2', reason: 'Render Job #RND-8220', debit: 1, credit: 0, createdAt: new Date() },
];


export default function CreditsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Credit Management</h1>
        <Dialog>
            <DialogTrigger asChild>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adjust Credits
            </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Manual Credit Adjustment</DialogTitle>
                <DialogDescription>
                Add or remove credits for a specific user. Use negative numbers to debit.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="userId" className="text-right">
                    User ID
                </Label>
                <Input id="userId" placeholder="e.g. user-abc-123" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                    Amount
                </Label>
                <Input id="amount" type="number" placeholder="e.g. 100 or -10" className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">
                    Reason
                </Label>
                <Input id="reason" placeholder="e.g. Promotional credits" className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="submit">Apply Adjustment</Button>
            </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Credit Ledger</CardTitle>
          <CardDescription>
            An immutable log of all credit transactions in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead className="hidden md:table-cell text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-mono text-xs">{entry.id}</TableCell>
                  <TableCell className="font-mono text-xs">{entry.userId}</TableCell>
                  <TableCell>{entry.reason}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">{entry.debit > 0 ? entry.debit : '-'}</TableCell>
                  <TableCell className="text-right font-medium text-green-600">{entry.credit > 0 ? entry.credit : '-'}</TableCell>
                  <TableCell className="hidden md:table-cell text-right">{entry.createdAt.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
