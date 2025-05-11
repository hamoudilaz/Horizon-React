export function Loading() {
  return (
    <svg viewBox="25 25 50 50" className="container">
      <circle cx="50" cy="50" r="20" className="loader"></circle>
    </svg>
  );
}

import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';

export function Switches({ curr, mode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontWeight: 'bold', cursor: 'help', fontSize: '13px' }}>Execution mode:</label>

      <div>
        <Tooltip
          title={
            <span
              style={{
                whiteSpace: 'nowrap',
              }}>
              Minimum of 0.001 SOL in prio fee is required for turbo mode
            </span>
          }
          placement="bottom"
          arrow>
          <Switch
            checked={curr}
            onChange={(e) => mode(e.target.checked)}
            color="success"
            sx={{
              '& .MuiSwitch-track': {
                backgroundColor: curr ? '#4caf50' : '#ccc',
              },
            }}
          />
          <label style={{ fontWeight: 'bold', fontSize: '12px' }}>{curr ? '(Turbo)' : '(Standard)'}</label>
        </Tooltip>
      </div>
    </div>
  );
}
