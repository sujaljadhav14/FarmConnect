import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import FarmerMenu from "../../Dashboards/FamerMenu";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";
import { CreditCard, Bank, CheckCircle, PencilSquare } from "react-bootstrap-icons";

const BankDetails = () => {
    const { auth } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountNumber: "",
        accountName: "",
        bankName: "",
        branch: "",
        ifscCode: "",
        branchAddress: "",
    });

    useEffect(() => {
        fetchBankDetails();
    }, []);

    const fetchBankDetails = async () => {
        try {
            const { data } = await axios.get("/api/auth/profile", {
                headers: { Authorization: `Bearer ${auth?.token}` },
            });

            if (data.success && data.user.bankDetails) {
                setBankDetails({
                    accountNumber: data.user.bankDetails.accountNumber || "",
                    accountName: data.user.bankDetails.accountName || "",
                    bankName: data.user.bankDetails.bankName || "",
                    branch: data.user.bankDetails.branch || "",
                    ifscCode: data.user.bankDetails.ifscCode || "",
                    branchAddress: data.user.bankDetails.branchAddress || "",
                });
                // If we have some data, we're in view mode
                if (data.user.bankDetails.accountNumber) {
                    setIsEditing(false);
                } else {
                    setIsEditing(true);
                }
            } else {
                setIsEditing(true); // No data, start in edit mode
            }
        } catch (error) {
            console.error("Error fetching bank details:", error);
            setIsEditing(true);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setBankDetails({
            ...bankDetails,
            [e.target.name]: e.target.value,
        });
    };

    const validateIFSC = (ifsc) => {
        // IFSC code format: 4 letters (bank code) + 0 + 6 characters (branch code)
        const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
        return ifscRegex.test(ifsc.toUpperCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankName || !bankDetails.ifscCode) {
            toast.error("Please fill all required fields");
            return;
        }

        if (!validateIFSC(bankDetails.ifscCode)) {
            toast.error("Invalid IFSC code format");
            return;
        }

        setSaving(true);
        try {
            const { data } = await axios.put(
                "/api/auth/update-bank-details",
                { bankDetails },
                {
                    headers: { Authorization: `Bearer ${auth?.token}` },
                }
            );

            if (data.success) {
                toast.success("Bank details saved successfully!");
                setIsEditing(false);
            } else {
                toast.error(data.message || "Failed to save bank details");
            }
        } catch (error) {
            console.error("Error saving bank details:", error);
            toast.error(error.response?.data?.message || "Failed to save bank details");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout title="Bank Details">
                <div className="container-fluid mt-4">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 mb-3">
                            <FarmerMenu />
                        </div>
                        <div className="col-md-9 col-lg-10">
                            <div className="text-center mt-5">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3">Loading bank details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Bank Details">
            <div className="container-fluid mt-4">
                <div className="row">
                    {/* Sidebar */}
                    <div className="col-md-3 col-lg-2 mb-3">
                        <FarmerMenu />
                    </div>

                    {/* Main Content */}
                    <div className="col-md-9 col-lg-10">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h3 className="text-success mb-0">
                                <Bank className="me-2" />
                                Bank Details
                            </h3>
                            {!isEditing && (
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <PencilSquare className="me-2" />
                                    Edit Details
                                </button>
                            )}
                        </div>

                        {/* Info Alert */}
                        <div className="alert alert-info mb-4">
                            <h6 className="alert-heading">💰 Why do we need your bank details?</h6>
                            <p className="mb-0 small">
                                Your bank account details are required to process payments for your crop sales.
                                Payments from traders will be directly deposited to this account.
                            </p>
                        </div>

                        <div className="card shadow-sm">
                            <div className="card-header bg-success text-white">
                                <h5 className="mb-0">
                                    <CreditCard className="me-2" />
                                    {isEditing ? "Enter Bank Account Details" : "Your Bank Account"}
                                </h5>
                            </div>
                            <div className="card-body">
                                {isEditing ? (
                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Account Holder Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="accountName"
                                                    value={bankDetails.accountName}
                                                    onChange={handleChange}
                                                    placeholder="Enter account holder name"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Account Number <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="accountNumber"
                                                    value={bankDetails.accountNumber}
                                                    onChange={handleChange}
                                                    placeholder="Enter account number"
                                                    pattern="[0-9]+"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    Bank Name <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="bankName"
                                                    value={bankDetails.bankName}
                                                    onChange={handleChange}
                                                    placeholder="e.g., State Bank of India"
                                                    required
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">
                                                    IFSC Code <span className="text-danger">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    className="form-control text-uppercase"
                                                    name="ifscCode"
                                                    value={bankDetails.ifscCode}
                                                    onChange={handleChange}
                                                    placeholder="e.g., SBIN0001234"
                                                    maxLength="11"
                                                    required
                                                />
                                                <small className="text-muted">
                                                    11 characters: 4 letters + 0 + 6 alphanumeric
                                                </small>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Branch Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="branch"
                                                    value={bankDetails.branch}
                                                    onChange={handleChange}
                                                    placeholder="Enter branch name"
                                                />
                                            </div>
                                            <div className="col-md-6 mb-3">
                                                <label className="form-label">Branch Address</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="branchAddress"
                                                    value={bankDetails.branchAddress}
                                                    onChange={handleChange}
                                                    placeholder="Enter branch address"
                                                />
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                type="submit"
                                                className="btn btn-success"
                                                disabled={saving}
                                            >
                                                {saving ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="me-2" />
                                                        Save Bank Details
                                                    </>
                                                )}
                                            </button>
                                            {bankDetails.accountNumber && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => {
                                                        fetchBankDetails();
                                                        setIsEditing(false);
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                ) : (
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <p className="text-muted mb-1">Account Holder Name</p>
                                            <h5>{bankDetails.accountName}</h5>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <p className="text-muted mb-1">Account Number</p>
                                            <h5>
                                                ****{bankDetails.accountNumber.slice(-4)}
                                                <span className="badge bg-success ms-2">Verified</span>
                                            </h5>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <p className="text-muted mb-1">Bank Name</p>
                                            <h5>{bankDetails.bankName}</h5>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <p className="text-muted mb-1">IFSC Code</p>
                                            <h5>{bankDetails.ifscCode}</h5>
                                        </div>
                                        {bankDetails.branch && (
                                            <div className="col-md-6 mb-3">
                                                <p className="text-muted mb-1">Branch Name</p>
                                                <h5>{bankDetails.branch}</h5>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Note */}
                        <div className="alert alert-secondary mt-4">
                            <h6 className="alert-heading">🔒 Security Note</h6>
                            <p className="mb-0 small">
                                Your bank details are encrypted and stored securely. We never share your
                                banking information with third parties. All transactions are processed
                                through secure payment gateways.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BankDetails;
