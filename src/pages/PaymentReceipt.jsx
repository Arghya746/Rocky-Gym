import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import API_URL from '../config/api';

export default function PaymentReceipt() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPayment = async () => {
            try {
                const token = localStorage.getItem('adminToken');

                const response = await fetch(
                   `${API_URL}/api/payments/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || 'Failed to fetch payment.'
                    );
                }

                setPayment(data.payment);

            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPayment();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div>Loading payment receipt...</div>;
    }

    if (error) {
        return (
            <div>
                <h2>Unable to load receipt</h2>
                <p>{error}</p>

                <button onClick={() => navigate('/admin')}>
                    BACK TO DASHBOARD
                </button>
            </div>
        );
    }

    if (!payment) {
        return <div>Payment not found.</div>;
    }

    const member = payment.member;

    return (
        <div className="payment-receipt-page">

            <div className="payment-receipt">

                <div className="payment-receipt-header">
                    <p>ALPHA GYM</p>
                    <h1>PAYMENT RECEIPT</h1>
                    <span>Official Membership Payment Receipt</span>
                </div>

                <div className="payment-receipt-info">

                    <div>
                        <strong>Invoice Number</strong>
                        <span>{payment.invoiceNumber}</span>
                    </div>

                    <div>
                        <strong>Payment Date</strong>
                        <span>
                            {new Date(
                                payment.paymentDate
                            ).toLocaleDateString('en-IN')}
                        </span>
                    </div>

                    <div>
                        <strong>Payment Status</strong>
                        <span>{payment.status}</span>
                    </div>

                </div>

                <div className="payment-receipt-member">

                    <h2>MEMBER DETAILS</h2>

                    <p>
                        <strong>Name:</strong>{' '}
                        {member?.name || 'N/A'}
                    </p>

                    <p>
                        <strong>Phone:</strong>{' '}
                        {member?.phone || 'N/A'}
                    </p>

                    <p>
                        <strong>Email:</strong>{' '}
                        {member?.email || 'N/A'}
                    </p>

                    <p>
                        <strong>Membership Plan:</strong>{' '}
                        {member?.membershipPlan || 'N/A'}
                    </p>

                </div>

                <div className="payment-receipt-payment">

                    <h2>PAYMENT DETAILS</h2>

                    <div className="receipt-row">
                        <span>Payment Method</span>
                        <strong>{payment.paymentMethod}</strong>
                    </div>

                    <div className="receipt-row">
                        <span>Amount Paid</span>
                        <strong>₹{payment.amount}</strong>
                    </div>

                </div>

                {payment.notes && (
                    <div className="payment-receipt-notes">
                        <strong>Notes:</strong>
                        <p>{payment.notes}</p>
                    </div>
                )}

                <div className="payment-receipt-footer">
                    <p>Thank you for choosing Alpha Gym.</p>
                    <span>This is a computer-generated receipt.</span>
                </div>

                <div className="payment-receipt-actions">

                    <button
                        type="button"
                        onClick={handlePrint}
                    >
                        PRINT RECEIPT
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                    >
                        BACK TO DASHBOARD
                    </button>

                </div>

            </div>

        </div>
    );
}