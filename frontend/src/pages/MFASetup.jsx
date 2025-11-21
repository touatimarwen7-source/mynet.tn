import { useState } from 'react';
import axios from 'axios';

export default function MFASetup() {
  const [step, setStep] = useState('setup');
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSetupMFA = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/mfa/setup', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setSecret(response.data.secret);
      setQrCode(response.data.qrCode);
      setBackupCodes(response.data.backupCodes);
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la configuration MFA');
    }
  };

  const handleVerifyMFA = async () => {
    if (!token || token.length !== 6) {
      setError('Entrez un code à 6 chiffres depuis l\'application');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/auth/mfa/verify-setup', 
        { token, secret, backupCodes },
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      setSuccess('Authentification à deux facteurs activée avec succès !');
      setStep('setup');
      setToken('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la vérification');
    }
  };

  return (
    <div className="mfa-setup-container">
      <h2>Authentification à deux facteurs (MFA)</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {step === 'setup' && (
        <div className="setup-section">
          <p>Pour renforcer la sécurité de votre compte, vous pouvez activer l'authentification à deux facteurs</p>
          <button onClick={handleSetupMFA} className="btn btn-primary">
            Activer l'authentification à deux facteurs
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="verify-section">
          <h3>Étapes d'activation :</h3>
          <ol>
            <li>Ouvrez une application d'authentification (Google Authenticator, Microsoft Authenticator, etc.)</li>
            <li>Scannez le code QR ci-dessous :
              {qrCode && <img src={qrCode} alt="QR Code" className="qr-code" />}
            </li>
            <li>Entrez le code depuis l'application :
              <input 
                type="text" 
                placeholder="000000" 
                maxLength="6"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mfa-input"
              />
            </li>
            <li>Conservez les codes de sauvegarde :
              <div className="backup-codes">
                {backupCodes.map((code, idx) => (
                  <code key={idx}>{code}</code>
                ))}
              </div>
            </li>
          </ol>
          <button onClick={handleVerifyMFA} className="btn btn-success">
            Confirmer l'authentification
          </button>
        </div>
      )}
    </div>
  );
}
