import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Eye, Download, CheckCircle, Clock, XCircle, User, Calendar, FileText, DollarSign, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subjectPaymentsApi, SubjectPaymentSubmission } from '@/api/subjectPayments.api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import VerifySubjectPaymentDialog from '@/components/forms/VerifySubjectPaymentDialog';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

const PaymentSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const paymentId = searchParams.get('paymentId');
  const paymentTitle = searchParams.get('paymentTitle');
  
  const [submissions, setSubmissions] = useState<SubjectPaymentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [verifyingSubmission, setVerifyingSubmission] = useState<SubjectPaymentSubmission | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Check if user can verify submissions (InstituteAdmin or Teacher only)
  const canVerifySubmissions = user?.userType === 'INSTITUTE_ADMIN' || user?.userType === 'TEACHER';
  
  const loadSubmissions = async (newPage?: number, newRowsPerPage?: number) => {
    if (loading || !paymentId) return;
    
    const currentPage = newPage !== undefined ? newPage + 1 : page + 1; // API uses 1-based indexing
    const currentLimit = newRowsPerPage || rowsPerPage;
    
    setLoading(true);
    try {
      const response = await subjectPaymentsApi.getPaymentSubmissions(paymentId, currentPage, currentLimit);
      setSubmissions(response.data);
      setTotalCount(response.total);
      setLoaded(true);
      toast({
        title: "Success",
        description: "Payment submissions loaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payment submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifySubmission = async (status: 'VERIFIED' | 'REJECTED', rejectionReason?: string, notes?: string) => {
    if (!verifyingSubmission) return;
    try {
      await subjectPaymentsApi.verifyPaymentSubmission(verifyingSubmission.id, {
        status,
        rejectionReason,
        notes
      });
      toast({
        title: "Success",
        description: `Payment submission ${status.toLowerCase()} successfully.`
      });

      // Reload submissions
      setLoaded(false);
      loadSubmissions(page, rowsPerPage);
      setVerifyingSubmission(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify payment submission.",
        variant: "destructive"
      });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    loadSubmissions(newPage, rowsPerPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadSubmissions(0, newRowsPerPage);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'error';
      default:
        return 'default';
    }
  };

  const columns = [
    { id: 'username', label: 'Student Name', minWidth: 150 },
    { id: 'submittedAmount', label: 'Amount', minWidth: 100, align: 'right' as const },
    { id: 'transactionId', label: 'Transaction ID', minWidth: 150 },
    { id: 'paymentDate', label: 'Payment Date', minWidth: 120 },
    { id: 'status', label: 'Status', minWidth: 100 },
    { id: 'uploadedAt', label: 'Submitted At', minWidth: 120 },
    { id: 'actions', label: 'Actions', minWidth: 150 },
  ];

  return <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                <FileText className="h-8 w-8" />
                <span>Payment Submissions</span>
              </h1>
              {paymentTitle && <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                  Viewing submissions for: {paymentTitle}
                </p>}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!loaded && <Button onClick={() => loadSubmissions()} disabled={loading} className="flex items-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>{loading ? 'Loading...' : 'Load Submissions'}</span>
              </Button>}
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Payment Submissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!loaded ? (
              <div className="text-center py-12">
                <Button onClick={() => loadSubmissions()} disabled={loading} className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>{loading ? 'Loading...' : 'Load Submissions'}</span>
                </Button>
              </div>
            ) : (
              <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader aria-label="payment submissions table">
                    <TableHead>
                      <TableRow>
                        {columns.map((column) => (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            style={{ minWidth: column.minWidth }}
                          >
                            {column.label}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submissions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={columns.length} align="center" sx={{ py: 8 }}>
                            <div className="text-center">
                              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                No submissions found
                              </p>
                              <p className="text-gray-400 dark:text-gray-500">
                                Payment submissions will appear here when students submit payments.
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        submissions.map((submission) => (
                          <TableRow hover role="checkbox" tabIndex={-1} key={submission.id}>
                            <TableCell>{submission.username || 'Unknown User'}</TableCell>
                            <TableCell align="right">
                              Rs {parseFloat(submission.submittedAmount || '0').toLocaleString()}
                            </TableCell>
                            <TableCell>{submission.transactionId}</TableCell>
                            <TableCell>
                              {new Date(submission.paymentDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusColor(submission.status) as any}>
                                {submission.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(submission.uploadedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {submission.receiptUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(submission.receiptUrl, '_blank')}
                                    className="flex items-center space-x-1"
                                  >
                                    <Download className="h-3 w-3" />
                                    <span>Receipt</span>
                                  </Button>
                                )}
                                {canVerifySubmissions && submission.status === 'PENDING' && (
                                  <Button
                                    onClick={() => setVerifyingSubmission(submission)}
                                    className="flex items-center space-x-1"
                                    size="sm"
                                  >
                                    <Shield className="h-4 w-4" />
                                    <span>Verify</span>
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[25, 50, 100]}
                  component="div"
                  count={totalCount}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Paper>
            )}
          </CardContent>
        </Card>
        
        {/* Verification Dialog */}
        <VerifySubjectPaymentDialog open={!!verifyingSubmission} onOpenChange={open => !open && setVerifyingSubmission(null)} submission={verifyingSubmission} onVerify={handleVerifySubmission} />
      </div>
    </AppLayout>;
};
export default PaymentSubmissionsPage;