/* export function Copy() {
  return (
    <>
      <div className="trade-form">
        <h2 className="trade-settings">Copy trade settings</h2>
        <form className="styleBox wallet tradeContent" onSubmit={handleSubmit}>
          <div className="trade-settings">
            {mess ? (
              <p style={{ textAlign: 'center' }}>
                <strong className="success">Successfull!</strong>
              </p>
            ) : null}
          </div>

          <button className="buy-btn bttn buybtn" type="submit" disabled={loading}>
            {loading ? (
              <span className="text">
                <ClipLoader size={20} color="#fff" />
              </span>
            ) : (
              <span className="text">Start copy trade</span>
            )}
          </button>
          {loading ? <span className="status">Loading...</span> : error && <span className="status">{error}</span>}
        </form>
      </div>
    </>
  );
} */

export function Input({ value, setValue }) {
  return (
    <>
      <label>Wallet adress target:</label>

      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter wallet to copy trade" />
    </>
  );
}

export function Amount({ value, setValue }) {
  return (
    <>
      <label>Fixed amount:</label>
      <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Enter Amount to copy" />
    </>
  );
}

export function Options({ slip, setSlip, jito, setJito, fee, setFee }) {
  return (
    <>
      <div className="fee-option">
        <div className="slippage">
          <label>Slippage (%):</label>
          <input type="number" value={slip} onChange={(e) => setSlip(e.target.value)} />
        </div>
        <div className="slippage">
          <label>Priority fee:</label>
          <input type="number" value={jito} onChange={(e) => setJito(e.target.value)} />
        </div>
        <div className="select">
          <label>Base fee:</label>
          <select value={fee} onChange={(e) => setFee(e.target.value)}>
            <option value="0.0001">High</option>
            <option value="0.00001">Low</option>
            <option value="0.000001">Very low </option>
          </select>
        </div>
      </div>
    </>
  );
}
