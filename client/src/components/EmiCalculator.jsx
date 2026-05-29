import { useMemo, useState } from 'react';
import { money } from './PropertyCard.jsx';

export default function EmiCalculator() {
  const [loan, setLoan] = useState({ amount: 7500000, rate: 8.6, years: 20 });

  const result = useMemo(() => {
    const principal = Number(loan.amount);
    const monthlyRate = Number(loan.rate) / 12 / 100;
    const months = Number(loan.years) * 12;
    const emi = monthlyRate ? (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1) : principal / months;
    const total = emi * months;
    return { emi, total, interest: total - principal };
  }, [loan]);

  return (
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4>Loan EMI Calculator</h4>
            <div className="row g-3 mt-1">
              <div className="col-md-4"><label className="form-label">Loan amount<input type="number" className="form-control" value={loan.amount} onChange={(event) => setLoan({ ...loan, amount: event.target.value })} /></label></div>
              <div className="col-md-4"><label className="form-label">Interest rate<input type="number" step="0.1" className="form-control" value={loan.rate} onChange={(event) => setLoan({ ...loan, rate: event.target.value })} /></label></div>
              <div className="col-md-4"><label className="form-label">Duration years<input type="number" className="form-control" value={loan.years} onChange={(event) => setLoan({ ...loan, years: event.target.value })} /></label></div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="vstack gap-3">
          <div className="result-tile"><span>Monthly EMI</span><strong>{money(result.emi)}</strong></div>
          <div className="result-tile"><span>Interest Amount</span><strong>{money(result.interest)}</strong></div>
          <div className="result-tile"><span>Total Repayment</span><strong>{money(result.total)}</strong></div>
        </div>
      </div>
    </div>
  );
}
