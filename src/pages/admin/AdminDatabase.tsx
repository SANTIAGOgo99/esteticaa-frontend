import { useState } from 'react';
import { Activity, Archive, Database } from 'lucide-react';
import AdminBackups from './AdminBackups';
import AdminStats from './AdminStats';
import './AdminDatabase.css';

type DatabaseTab = 'backups' | 'monitoring';

const AdminDatabase = () => {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('backups');

  return (
    <div className="admin-database-page">
      <div className="admin-database-hero">
        <div>
          <span className="admin-database-kicker">
            <Database size={16} />
            Base de datos
          </span>
          <h1>Centro de Control BD</h1>
          <p>
            Administra respaldos, configuracion automatica y monitoreo tecnico desde un solo modulo.
          </p>
        </div>
      </div>

      <div className="admin-database-tabs">
        <button
          className={activeTab === 'backups' ? 'active' : ''}
          onClick={() => setActiveTab('backups')}
        >
          <Archive size={18} />
          Respaldos
        </button>
        <button
          className={activeTab === 'monitoring' ? 'active' : ''}
          onClick={() => setActiveTab('monitoring')}
        >
          <Activity size={18} />
          Monitoreo
        </button>
      </div>

      <div className="admin-database-content">
        {activeTab === 'backups' && <AdminBackups />}
        {activeTab === 'monitoring' && <AdminStats />}
      </div>
    </div>
  );
};

export default AdminDatabase;
