export const GetAll = ({ AllTokens }) => {
  return (
    <>
      <ul className="tokenBox">
        {AllTokens.map((obj) => {
          <li key={obj.mint} className="tokenList">
            <span className="tokenInfo">{obj.mint} </span>
            <span className="tokenInfo">
              Tokens: <span className="value">{Number(obj.balance).toFixed(0)}</span>
            </span>
            <span className="tokenInfo">{obj.total} </span>
            <div className="sellToken">
              <button className="bttn" value="50"></button>
              <button className="bttn" value="100"></button>
            </div>
          </li>;
        })}
      </ul>
    </>
  );
};
