import { useState, useEffect } from 'react';
import { getAllClans, getTopClans, getRecruitingClans } from '../services/api';

export default function Stats() {
  const [clans, setClans] = useState([]);
  const [topClans, setTopClans] = useState([]);
  const [recruiting, setRecruiting] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [all, top, rec] = await Promise.all([
          getAllClans(),
          getTopClans(5),
          getRecruitingClans(),
        ]);
        setClans(all.data);
        setTopClans(top.data);
        setRecruiting(rec.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalMembers = clans.reduce((sum, c) => sum + (c.currentMembers || 0), 0);
  const totalWins = clans.reduce((sum, c) => sum + (c.totalWins || 0), 0);
  const totalLosses = clans.reduce((sum, c) => sum + (c.totalLosses || 0), 0);
  const avgWinRate = clans.length > 0
    ? Math.round((totalWins / (totalWins + totalLosses || 1)) * 100)
    : 0;

  const activeClans = clans.filter(c => c.status === 'ACTIVE');

  if (loading) return <div className="page-wrapper"><div className="container"><div className="spinner" /></div></div>;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>

        <div className="page-header fade-up">
          <h1 className="page-title">◈ Global Stats</h1>
          <p className="page-subtitle">Overview of all clans and activity</p>
        </div>

        {/* Overview stats */}
        <div className="fade-up-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px'
        }}>
          {[
            { label: 'Total Clans', value: clans.length, icon: '🏰', color: 'var(--accent-bright)' },
            { label: 'Total Warriors', value: totalMembers, icon: '⚔', color: 'var(--accent2)' },
            { label: 'Total Battles', value: totalWins + totalLosses, icon: '🏆', color: 'var(--gold)' },
            { label: 'Overall Win%', value: `${avgWinRate}%`, icon: '📈', color: 'var(--success)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>{icon}</div>
              <div className="stat-value" style={{ fontSize: '36px', color }}>{value}</div>
              <div className="stat-label" style={{ marginTop: '8px' }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

          {/* Leaderboard */}
          <div className="card fade-up-delay-2">
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
              🏆 Top Clans by XP
            </h3>
            {topClans.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="empty-state-icon">🏆</div>
                <div className="empty-state-text">No data yet</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topClans.map((clan, i) => (
                  <div key={clan.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '8px',
                    border: i === 0 ? '1px solid rgba(255,215,0,0.3)' : '1px solid transparent',
                  }}>
                    <div style={{
                      width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '18px',
                      color: i === 0 ? 'var(--gold)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--text-muted)',
                    }}>#{i + 1}</div>
                    <div style={{
                      width: 36, height: 36, borderRadius: '6px',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '13px', color: '#fff',
                    }}>{clan.tag?.substring(0, 2)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '16px' }}>{clan.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {clan.currentMembers} members · Lv.{clan.clanLevel}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--accent-bright)' }}>
                        {clan.clanXp?.toLocaleString()} XP
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--success)' }}>{clan.totalWins}W</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recruiting clans */}
          <div className="card fade-up-delay-3">
            <h3 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
              🛡 Open Recruitment
            </h3>
            {recruiting.length === 0 ? (
              <div className="empty-state" style={{ padding: '30px' }}>
                <div className="empty-state-icon">🛡</div>
                <div className="empty-state-text">No clans recruiting</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recruiting.slice(0, 6).map(clan => (
                  <div key={clan.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px',
                    background: 'var(--bg-secondary)', borderRadius: '6px',
                  }}>
                    <div>
                      <span style={{ fontFamily: 'Rajdhani', fontWeight: 700 }}>{clan.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>[{clan.tag}]</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {clan.currentMembers}/{clan.maxMembers}
                      </span>
                      <span className="badge badge-info">Open</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Clans Table */}
        <div className="card fade-up-delay-4" style={{ marginTop: '24px' }}>
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
            🏰 All Clans
          </h3>
          <table className="table">
            <thead>
              <tr>
                <th>Clan</th>
                <th>Leader</th>
                <th>Members</th>
                <th>Level</th>
                <th>Wins</th>
                <th>Losses</th>
                <th>Win Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clans.map(clan => {
                const wr = clan.totalWins + clan.totalLosses > 0
                  ? Math.round((clan.totalWins / (clan.totalWins + clan.totalLosses)) * 100)
                  : 0;
                return (
                  <tr key={clan.id}>
                    <td>
                      <span style={{ fontFamily: 'Rajdhani', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {clan.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>[{clan.tag}]</span>
                    </td>
                    <td style={{ color: 'var(--gold)', fontWeight: 600 }}>{clan.leader?.username || '-'}</td>
                    <td>{clan.currentMembers}/{clan.maxMembers}</td>
                    <td><span className="badge badge-gold">Lv.{clan.clanLevel}</span></td>
                    <td style={{ color: 'var(--success)' }}>{clan.totalWins}</td>
                    <td style={{ color: 'var(--danger)' }}>{clan.totalLosses}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          flex: 1, height: 4, background: 'var(--bg-secondary)', borderRadius: '2px', minWidth: '60px'
                        }}>
                          <div style={{
                            width: `${wr}%`, height: '100%', borderRadius: '2px',
                            background: wr >= 60 ? 'var(--success)' : wr >= 40 ? 'var(--warning)' : 'var(--danger)',
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '32px' }}>{wr}%</span>
                      </div>
                    </td>
                    <td>
                      {clan.status === 'ACTIVE'
                        ? <span className="badge badge-success">Active</span>
                        : <span className="badge badge-danger">{clan.status}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
