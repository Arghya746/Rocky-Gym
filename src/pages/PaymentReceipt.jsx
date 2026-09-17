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
        const adminToken =
            localStorage.getItem('adminToken');

        if (!adminToken) {
            navigate('/admin/login', {
                replace: true,
            });
            return;
        }

        fetchPayment();
    }, [id]);

    const fetchPayment = async () => {
        try {
            setLoading(true);
            setError('');

            const adminToken =
                localStorage.getItem('adminToken');

            if (!adminToken) {
                navigate('/admin/login', {
                    replace: true,
                });
                return;
            }

            const response = await fetch(
                `${API_URL}/api/payments/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${adminToken}`,
                    },
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Unable to fetch payment receipt.'
                );
            }

            setPayment(data.payment);

        } catch (error) {
            console.error(
                'Payment Receipt Error:',
                error
            );

            setError(
                error.message ||
                'Unable to load payment receipt.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '—';

        return new Date(date).toLocaleDateString(
            'en-IN',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }
        );
    };

    if (loading) {
        return (
            <div className="payment-receipt-page">
                <div className="payment-receipt-loading">
                    LOADING PAYMENT RECEIPT...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="payment-receipt-page">
                <div className="payment-receipt-error">

                    <h2>
                        UNABLE TO LOAD RECEIPT
                    </h2>

                    <p>{error}</p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin')
                        }
                    >
                        ← BACK TO DASHBOARD
                    </button>

                </div>
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="payment-receipt-page">
                <div className="payment-receipt-error">

                    <h2>
                        PAYMENT NOT FOUND
                    </h2>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin')
                        }
                    >
                        ← BACK TO DASHBOARD
                    </button>

                </div>
            </div>
        );
    }

    const member = payment.member;

    return (
        <div className="payment-receipt-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="payment-receipt-header">

                <div>
                    <span className="section-tag">
                        ALPHA GYM
                    </span>

                    <h1>
                        PAYMENT <span>RECEIPT.</span>
                    </h1>

                    <p>
                        Official Membership Payment Receipt
                    </p>
                </div>

                <div className="payment-receipt-invoice">

                    <span>
                        INVOICE NUMBER
                    </span>

                    <strong>
                        {payment.invoiceNumber ||
                            '—'}
                    </strong>

                </div>

            </div>


            {/* =========================
                RECEIPT
            ========================= */}

            <section className="payment-receipt-card">

                {/* RECEIPT TOP */}

                <div className="payment-receipt-top">

                    <div>
                        <span>
                            PAYMENT DATE
                        </span>

                        <strong>
                            {formatDate(
                                payment.paymentDate
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>
                            PAYMENT STATUS
                        </span>

                        <strong>
                            {payment.status ||
                                'Pending'}
                        </strong>
                    </div>

                </div>


                {/* =========================
                    MEMBER DETAILS
                ========================= */}

                <div className="payment-receipt-section">

                    <div className="payment-receipt-section-title">
                        MEMBER DETAILS
                    </div>

                    <div className="payment-receipt-info-grid">

                        <div className="payment-receipt-info-item">

                            <span>NAME</span>

                            <strong>
                                {member?.name ||
                                    '—'}
                            </strong>

                        </div>

                        <div className="payment-receipt-info-item">

                            <span>PHONE</span>

                            <strong>
                                {member?.phone ||
                                    '—'}
                            </strong>

                        </div>

                        <div className="payment-receipt-info-item">

                            <span>EMAIL</span>

                            <strong>
                                {member?.email ||
                                    '—'}
                            </strong>

                        </div>

                        <div className="payment-receipt-info-item">

                            <span>
                                MEMBERSHIP PLAN
                            </span>

                            <strong>
                                {member?.membershipPlan ||
                                    '—'}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =========================
                    PAYMENT DETAILS
                ========================= */}

                <div className="payment-receipt-section">

                    <div className="payment-receipt-section-title">
                        PAYMENT DETAILS
                    </div>

                    <div className="payment-receipt-payment-grid">

                        <div className="payment-receipt-info-item">

                            <span>
                                PAYMENT METHOD
                            </span>

                            <strong>
                                {payment.paymentMethod ||
                                    '—'}
                            </strong>

                        </div>

                        <div className="payment-receipt-amount">

                            <span>
                                AMOUNT PAID
                            </span>

                            <strong>
                                ₹{Number(
                                    payment.amount || 0
                                ).toLocaleString(
                                    'en-IN'
                                )}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* =========================
                    FOOTER
                ========================= */}

                <div className="payment-receipt-footer">

                    <p>
                        Thank you for choosing Alpha Gym.
                    </p>

                    <span>
                        This is a computer-generated receipt.
                    </span>

                </div>


                {/* =========================
                    ACTIONS
                ========================= */}

                <div className="payment-receipt-actions">

                    <button
                        type="button"
                        onClick={() =>
                            window.print()
                        }
                    >
                        PRINT RECEIPT
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate('/admin')
                        }
                    >
                        BACK TO DASHBOARD
                    </button>

                </div>

            </section>

        </div>
    );
}