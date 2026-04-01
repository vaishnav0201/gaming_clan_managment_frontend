import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClan, getClanMembers, joinClan, leaveClan, kickMember, updateMemberRole } from '../services/api';

const ROLE_COLORS = {
  LEADER: 'var(--gold)',
  CO_LEADER: '#ff6b35',
  ELDER: 'var(--accent2)',
  MEMBER: 'var(--text-secondary)',
};

const ROLES = ['LEADER', 'CO_LEADER', 'ELDER', 'MEMBER'];

export default function ClanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [clan, setClan] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [myMembership, setMyMembership] = useState(null);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [clanRes, membersRes] = await Promise.all([getClan(id), getClanMembers(id)]);
      setClan(clanRes.data);
      setMembers(membersRes.data);
      const me = membersRes.data.find(m => m.user?.username === user.username);
      setMyMembership(me || null);
    } catch {
      showMsg('❌ Failed to load clan details.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleJoin = async () => {
    try { await joinClan(id); showMsg('✅ Joined!'); fetchAll(); }
    catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Could not join.')); }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this clan?')) return;
    try { await leaveClan(id); showMsg('✅ Left clan.'); fetchAll(); }
    catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Could not leave.')); }
  };

  const handleKick = async (memberId) => {
    if (!window.confirm('Kick this member?')) return;
    try { await kickMember(id, memberId); showMsg('✅ Member kicked.'); fetchAll(); }
    catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Could not kick.')); }
  };

  const handleRoleChange = async (memberId, role) => {
    try { await updateMemberRole(id, memberId, role); showMsg('✅ Role updated.'); fetchAll(); }
    catch (err) { showMsg('❌ ' + (err.response?.data?.message || 'Could not update role.')); }
  };

  const isLeader = myMembership?.memberRole === 'LEADER';
  const isCoLeader = myMembership?.memberRole === 'CO_LEADER';
  const canManage = isLeader || isCoLeader;

  if (loading) return <div className="page-wrapper"><div className="container"><div className="spinner" /></div></div>;
  if (!clan) return <div className="page-wrapper"><div className="container"><div className="alert alert-error">Clan not found.</div></div></div>;

  const winRate = clan.totalWins + clan.totalLosses > 0
    ? Math.round((clan.totalWins / (clan.totalWins + clan.totalLosses)) * 100)
    : 0;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>

        {msg && (
          <div style={{
            position: 'fixed', top: '80px', right: '24px', zIndex: 200,
            background: 'var(--bg-card)', border: '1px solid var(--border-bright)',
            padding: '12px 20px', borderRadius: '8px', animation: 'fadeUp 0.3s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', fontFamily: 'Rajdhani', fontWeight: 600,
          }}>{msg}</div>
        )}

        {/* Back */}
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/dashboard')}
          style={{ marginBottom: '24px' }}>
          ← Back
        </button>

        {/* Clan header */}
        <div className="card fade-up" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '22px', color: '#fff',
                boxShadow: '0 0 30px var(--accent-glow)',
              }}>{clan.tag?.substring(0, 2)}</div>
              <div>
                <h1 style={{ fontFamily: 'Rajdhani', fontSize: '32px', fontWeight: 700 }}>{clan.name}</h1>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>[{clan.tag}]</span>
                  {clan.status === 'ACTIVE'
                    ? <span className="badge badge-success">Active</span>
                    : <span className="badge badge-danger">{clan.status}</span>}
                  {clan.isRecruiting && <span className="badge badge-info">Recruiting</span>}
                  <span className="badge badge-gold">Lv.{clan.clanLevel}</span>
                </div>
                {clan.description && (
                  <p style={{ marginTop: '8px', fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '500px' }}>
                    {clan.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {myMembership ? (
                !isLeader && <button className="btn btn-danger btn-sm" onClick={handleLeave}>Leave Clan</button>
              ) : clan.isRecruiting && clan.status === 'ACTIVE' ? (
                <button className="btn btn-primary" onClick={handleJoin}>⚔ Join Clan</button>
              ) : null}
            </div>
          </div>

          {/* Stat strip */}
          <div className="divider" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            {[
              { label: 'Members', value: `${clan.currentMembers}/${clan.maxMembers}` },
              { label: 'Level', value: clan.clanLevel },
              { label: 'Total XP', value: clan.clanXp?.toLocaleString() },
              { label: 'Wins', value: clan.totalWins },
              { label: 'Win Rate', value: `${winRate}%` },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div className="stat-value" style={{ fontSize: '24px' }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Members table */}
        <div className="card fade-up-delay-1">
          <h3 style={{ fontFamily: 'Rajdhani', fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>
            🛡 Members ({members.length})
          </h3>

          {members.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">👥</div>
              <div className="empty-state-text">No members yet</div>
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Role</th>
                  <th>Contribution</th>
                  <th>Wins</th>
                  <th>Losses</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((member, i) => (
                  <tr key={member.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'Rajdhani' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', fontWeight: 700, color: '#fff', fontFamily: 'Rajdhani',
                        }}>
                          {member.user?.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{member.user?.username}</div>
                          {member.user?.gameTag && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{member.user.gameTag}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '13px',
                        color: ROLE_COLORS[member.memberRole] || 'var(--text-secondary)',
                      }}>
                        {member.memberRole?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--accent-bright)', fontFamily: 'Rajdhani', fontWeight: 700 }}>
                      {member.contributionPoints?.toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--success)' }}>{member.winsInClan}</td>
                    <td style={{ color: 'var(--danger)' }}>{member.lossesInClan}</td>
                    <td>
                      <span className={`badge ${member.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                        {member.status}
                      </span>
                    </td>
                    {canManage && (
                      <td>
                        {member.user?.username !== user.username && member.memberRole !== 'LEADER' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <select
                              className="form-input"
                              style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                              value={member.memberRole}
                              onChange={e => handleRoleChange(member.id, e.target.value)}
                            >
                              {ROLES.filter(r => r !== 'LEADER').map(r => (
                                <option key={r} value={r}>{r.replace('_', ' ')}</option>
                              ))}
                            </select>
                            <button className="btn btn-danger btn-sm" onClick={() => handleKick(member.id)}>Kick</button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
