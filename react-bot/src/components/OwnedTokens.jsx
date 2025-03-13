export function OwnedTokens() {
  const tokens = [
    { name: 'SOL', balance: 2.5 },
    { name: 'USDC', balance: 150 },
    { name: 'TOKENX', balance: 50 },
  ];

  return (
    <div className="owned-tokens">
      <h2>Owned Tokens</h2>
      <ul>
        {tokens.map((token) => (
          <li key={token.name}>
            <span>
              {token.name}: {token.balance}
            </span>
            <div className="sellToken">
              <button className="sell-50">Sell 50%</button>
              <button className="sell-100">Sell 100%</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
