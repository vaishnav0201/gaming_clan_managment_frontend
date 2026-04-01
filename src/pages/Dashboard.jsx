import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllClans, getClanMembers, createClan, joinClan, leaveClan, disbandClan } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [clans, setClans] = useState([]);
  const [membershipMap, setMembershipMap] = useState({}); // { clanId: true/false }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionMsg, setActionMsg] = useState('');
  const [actionType, setActionType] = useState('success'); // 'success' | 'error'

  const [createForm, setCreateForm] = useState({
    name: '', tag: '', description: '', maxMembers: 30, isRecruiting: true
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => { fetchClans(); }, []);

  const fetchClans = async () => {
    setLoading(true);
    try {
      const res = await getAllClans();
      const clanList = res.data;
      setClans(clanList);

      // For each clan, fetch members and check if current user is in it
      const map = {};
      await Promise.all(
        clanList.map(async (clan) => {
          try {
            const membersRes = await getClanMembers(clan.id);
            const members = membersRes.data;
            console.log('Clan:', clan.id, 'Members:', JSON.stringify(members));
            console.log('Current user:', user.username);
            map[clan.id] = members.some(
              (m) => m.user?.username === user.username
            );
          } catch {
            map[clan.id] = false;
          }
        })
      );
      setMembershipMap(map);
    } catch {
      setError('Failed to load clans.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateError(''); setCreateLoading(true);
    try {
      await createClan(createForm);
      setShowCreate(false);
      setCreateForm({ name: '', tag: '', description: '', maxMembers: 30, isRecruiting: true });
      showMsg('✅ Clan created successfully!', 'success');
      fetchClans();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create clan.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoin = async (clanId) => {
    try {
      await joinClan(clanId);
      showMsg('✅ Joined clan successfully!', 'success');
      fetchClans();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Could not join clan.'), 'error');
    }
  };

  const handleLeave = async (clanId) => {
    if (!window.confirm('Are you sure you want to leave this clan?')) return;
    try {
      await leaveClan(clanId);
      showMsg('✅ Left clan successfully!', 'success');
      fetchClans();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Could not leave clan.'), 'error');
    }
  };

  const handleDisband = async (clanId) => {
    if (!window.confirm('Are you sure you want to disband this clan?')) return;
    try {
      await disbandClan(clanId);
      showMsg('✅ Clan disbanded.', 'success');
      fetchClans();
    } catch (err) {
      showMsg('❌ ' + (err.response?.data?.message || 'Could not disband clan.'), 'error');
    }
  };

  const showMsg = (msg, type = 'success') => {
    setActionMsg(msg);
    setActionType(type);
    setTimeout(() => setActionMsg(''), 3500);
  };

  const isLeader = (clan) => clan.leader?.username === user.username;
  const isMember = (clan) => membershipMap[clan.id] === true;

  const filteredClans = clans.filter(clan => {
    const matchSearch =
      clan.name.toLowerCase().includes(search.toLowerCase()) ||
      clan.tag.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'recruiting' && clan.isRecruiting) ||
      (filter === 'mine' && (isLeader(clan) || isMember(clan)));
    return matchSearch && matchFilter;
  });

  const activeClans = clans.filter(c => c.status === 'ACTIVE').length;
  const recruitingClans = clans.filter(c => c.isRecruiting).length;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '40px' }}>

        {/* Toast notification */}
        {actionMsg && (
          <div style={{
            position: 'fixed', top: '80px', right: '24px', zIndex: 200,
            background: actionType === 'error' ? 'var(--bg-card)' : 'var(--bg-card)',
            border: `1px solid ${actionType === 'error' ? 'var(--danger, #e74c3c)' : 'var(--border-bright)'}`,
            padding: '12px 20px', borderRadius: '8px',
            animation: 'fadeUp 0.3s ease',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            fontFamily: 'Rajdhani', fontWeight: 600,
          }}>{actionMsg}</div>
        )}

        {/* Header */}
        <div className="page-header fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">⚔ Command Center</h1>
            <p className="page-subtitle">Manage your clans and warriors</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            + Create Clan
          </button>
        </div>

        {/* Stats row */}
        <div className="fade-up-delay-1" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px'
        }}>
          {[
            { label: 'Total Clans', value: clans.length, icon: '🏰' },
            { label: 'Active Clans', value: activeClans, icon: '⚡' },
            { label: 'Recruiting', value: recruitingClans, icon: '🛡' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="fade-up-delay-2" style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            placeholder="🔍 Search clans..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: '280px' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'recruiting', 'mine'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`btn ${filter === f ? 'btn-primary' : 'btn-outline'} btn-sm`}
                style={{ textTransform: 'capitalize' }}>
                {f === 'mine' ? 'My Clans' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Clans grid */}
        {loading ? (
          <div className="spinner" />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredClans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏰</div>
            <div className="empty-state-text">No clans found</div>
          </div>
        ) : (
          <div className="fade-up-delay-3" style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px'
          }}>
            {filteredClans.map((clan, i) => (
              <ClanCard
                key={clan.id}
                clan={clan}
                isLeader={isLeader(clan)}
                isMember={isMember(clan)}
                onView={() => navigate(`/clans/${clan.id}`)}
                onJoin={() => handleJoin(clan.id)}
                onLeave={() => handleLeave(clan.id)}
                onDisband={() => handleDisband(clan.id)}
                delay={i}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Clan Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="modal">
            <h3 className="modal-title">⚔ Create New Clan</h3>
            {createError && <div className="alert alert-error">{createError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Clan Name</label>
                <input className="form-input" placeholder="e.g. Dragon Warriors" required
                  value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Clan Tag (2-6 chars)</label>
                <input className="form-input" placeholder="e.g. DRG" required maxLength={6} minLength={2}
                  value={createForm.tag} onChange={e => setCreateForm({ ...createForm, tag: e.target.value.toUpperCase() })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" placeholder="What is your clan about?"
                  value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Max Members</label>
                  <input className="form-input" type="number" min={2} max={100}
                    value={createForm.maxMembers} onChange={e => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Recruiting</label>
                  <select className="form-input"
                    value={createForm.isRecruiting}
                    onChange={e => setCreateForm({ ...createForm, isRecruiting: e.target.value === 'true' })}>
                    <option value="true">Open</option>
                    <option value="false">Closed</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" disabled={createLoading}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  {createLoading ? 'Creating...' : '⚔ Create Clan'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}
                  style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ClanCard({ clan, isLeader, isMember, onView, onJoin, onLeave, onDisband }) {
  const winRate = clan.totalWins + clan.totalLosses > 0
    ? Math.round((clan.totalWins / (clan.totalWins + clan.totalLosses)) * 100)
    : 0;

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onView}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 44, height: 44,
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontFamily: 'Rajdhani', fontWeight: 700, color: '#fff',
          }}>
            {clan.tag?.substring(0, 2)}
          </div>
          <div>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '18px' }}>{clan.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>[{clan.tag}]</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', flexDirection: 'column', alignItems: 'flex-end' }}>
          {clan.status === 'ACTIVE'
            ? <span className="badge badge-success">Active</span>
            : <span className="badge badge-danger">{clan.status}</span>}
          {clan.isRecruiting && <span className="badge badge-info">Recruiting</span>}
          {isMember && !isLeader && (
            <span className="badge" style={{ background: 'var(--gold, #f1c40f)', color: '#000' }}>Member</span>
          )}
        </div>
      </div>

      {/* Description */}
      {clan.description && (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
          {clan.description.length > 80 ? clan.description.substring(0, 80) + '...' : clan.description}
        </p>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Members', value: `${clan.currentMembers}/${clan.maxMembers}` },
          { label: 'Level', value: clan.clanLevel },
          { label: 'Wins', value: clan.totalWins },
          { label: 'Win%', value: `${winRate}%` },
        ].map(({ label, value }) => (
          <div key={label} style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
            <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, fontSize: '16px', color: 'var(--accent-bright)' }}>{value}</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Leader + Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Leader: <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{clan.leader?.username || 'Unknown'}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
          {isLeader ? (
            // Current user is the leader → show Disband
            <button className="btn btn-danger btn-sm" onClick={onDisband}>Disband</button>
          ) : isMember ? (
            // Current user is a member (not leader) → show Leave
            <button className="btn btn-danger btn-sm" onClick={onLeave}>Leave</button>
          ) : clan.isRecruiting ? (
            // Not a member and clan is recruiting → show Join
            <button className="btn btn-outline btn-sm" onClick={onJoin}>Join</button>
          ) : null}
          <button className="btn btn-primary btn-sm" onClick={onView}>View →</button>
        </div>
      </div>
    </div>
  );
}
