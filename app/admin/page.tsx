"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './Admin.module.css';
import { Plus, Trash2, X, Upload, Palette } from 'lucide-react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [activeMainProduct, setActiveMainProduct] = useState('romana');
  const [activeKidsProduct, setActiveKidsProduct] = useState('chase');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);
  
  const [content, setContent] = useState<any>({
    hero: { title: '', subtitle: '' },
    about: { title: '', bodyHtml: '' },
    valueProposition: {
      title: '',
      card1Title: '', card1Desc: '',
      card2Title: '', card2Desc: '',
      card3Title: '', card3Desc: '',
      card4Title: '', card4Desc: ''
    },
    contact: { title: '', subtitle: '', email: '', phone: '', address: '' },
    mainCatalog: {},
    kidsCatalog: {}
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        // Asegurar que existan los catálogos en el estado
        if (!data.mainCatalog) data.mainCatalog = {};
        if (!data.kidsCatalog) data.kidsCatalog = {};
        setContent(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading content:", err);
        setIsLoading(false);
      });
  }, []);

  const handleChange = (section: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section: string, subSection: string, field: string, value: string) => {
    setContent((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...(prev[section][subSection] || {}),
          [field]: value
        }
      }
    }));
  };

  const handleAddFeature = (catalogKey: string, subKey: string) => {
    setContent((prev: any) => {
      const updated = { ...prev };
      if (!updated[catalogKey][subKey].features) {
        updated[catalogKey][subKey].features = [];
      }
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      updated[catalogKey][subKey].features.push({ id: uniqueId, label: '', value: '' });
      return updated;
    });
  };

  const handleUpdateFeature = (catalogKey: string, subKey: string, id: string, field: 'label' | 'value', value: string) => {
    setContent((prev: any) => {
      const updated = { ...prev };
      const features = updated[catalogKey][subKey].features;
      const featureIndex = features.findIndex((f: any) => f.id === id);
      if (featureIndex !== -1) {
        features[featureIndex][field] = value;
      }
      return updated;
    });
  };

  const handleRemoveFeature = (catalogKey: string, subKey: string, id: string) => {
    setContent((prev: any) => {
      const updated = { ...prev };
      updated[catalogKey][subKey].features = updated[catalogKey][subKey].features.filter((f: any) => f.id !== id);
      return updated;
    });
  };

  // === COLOR CRUD ===
  const handleAddColor = (catalogKey: string, subKey: string) => {
    setContent((prev: any) => {
      const updated = { ...prev };
      if (!updated[catalogKey][subKey].colors) {
        updated[catalogKey][subKey].colors = [];
      }
      const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      updated[catalogKey][subKey].colors.push({ id: uniqueId, name: '', hex: '#cccccc', image: '' });
      return updated;
    });
  };

  const handleUpdateColor = (catalogKey: string, subKey: string, id: string, field: 'name' | 'hex' | 'image', value: string) => {
    setContent((prev: any) => {
      const updated = { ...prev };
      const colors = updated[catalogKey][subKey].colors;
      const colorIndex = colors.findIndex((c: any) => c.id === id);
      if (colorIndex !== -1) {
        colors[colorIndex][field] = value;
      }
      return updated;
    });
  };

  const handleRemoveColor = (catalogKey: string, subKey: string, id: string) => {
    setContent((prev: any) => {
      const updated = { ...prev };
      updated[catalogKey][subKey].colors = updated[catalogKey][subKey].colors.filter((c: any) => c.id !== id);
      return updated;
    });
  };

  const handleColorImageUpload = async (catalogKey: string, subKey: string, colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingColorId(colorId);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        handleUpdateColor(catalogKey, subKey, colorId, 'image', data.url);
      } else {
        alert('Error subiendo imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de red al subir la imagen.');
    } finally {
      setUploadingColorId(null);
    }
  };

  const handleImageUpload = async (catalogKey: string, subKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        handleNestedChange(catalogKey, subKey, 'mainImage', data.url);
      } else {
        alert('Error subiendo imagen: ' + data.error);
      }
    } catch (err) {
      alert('Error de red al subir la imagen.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCollection = (catalogKey: 'mainCatalog' | 'kidsCatalog') => {
    const name = prompt('Ingresa el nombre interno (ID) de la nueva colección (sin espacios, minúsculas, ej: nueva_linea):');
    if (!name) return;
    
    setContent((prev: any) => {
      const updated = { ...prev };
      if (updated[catalogKey][name]) {
        alert('Esa colección ya existe.');
        return updated;
      }
      updated[catalogKey][name] = {
        title: 'Nueva Colección',
        features: []
      };
      
      if (catalogKey === 'mainCatalog') setActiveMainProduct(name);
      if (catalogKey === 'kidsCatalog') setActiveKidsProduct(name);
      
      return updated;
    });
  };

  const handleDeleteCollection = (catalogKey: 'mainCatalog' | 'kidsCatalog', subKey: string) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la colección "${subKey}"?`)) return;
    
    setContent((prev: any) => {
      const updated = { ...prev };
      delete updated[catalogKey][subKey];
      
      const remainingKeys = Object.keys(updated[catalogKey]);
      if (remainingKeys.length > 0) {
        if (catalogKey === 'mainCatalog') setActiveMainProduct(remainingKeys[0]);
        if (catalogKey === 'kidsCatalog') setActiveKidsProduct(remainingKeys[0]);
      }
      
      return updated;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      
      if (res.ok) {
        setSaveStatus('Cambios guardados con éxito');
        setTimeout(() => setSaveStatus(''), 3000);
      } else {
        setSaveStatus('Error al guardar.');
      }
    } catch (err) {
      setSaveStatus('Error de conexión.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  if (isLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>Cargando portal...</div>;
  }

  const renderCatalogEditor = (catalogKey: string, subKey: string, label: string) => {
    const item = content[catalogKey]?.[subKey] || {};
    const features = item.features || [];
    
    return (
      <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--contex-green)', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>{label}</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <label className={styles.label}>Título Principal del Producto</label>
          <input type="text" className={styles.input} value={item.title || ''} onChange={e => handleNestedChange(catalogKey, subKey, 'title', e.target.value)} />
        </div>

        <div style={{ marginBottom: '2rem', background: 'white', padding: '1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <label className={styles.label} style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
            Imagen Principal y Tarjeta Inicial (Cabecera de la cola)
          </label>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Color picker */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '70px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tono</label>
              <div style={{ width: '54px', height: '40px', borderRadius: '6px', background: item.mainColorHex || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '2px solid #cbd5e1' }}></div>
              <input 
                type="color" 
                value={item.mainColorHex?.startsWith('#') ? item.mainColorHex : '#e2e8f0'} 
                onChange={e => handleNestedChange(catalogKey, subKey, 'mainColorHex', e.target.value)}
                style={{ width: '54px', height: '26px', border: 'none', cursor: 'pointer', padding: 0 }}
                title="Elegir color de la tarjeta principal"
              />
            </div>

            {/* Nombre de la tarjeta */}
            <div style={{ flex: '1 1 200px' }}>
              <label className={styles.label} style={{ fontSize: '0.8rem' }}>Nombre de la Tarjeta</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="Ver Colección"
                value={item.mainColorName ?? ''} 
                onChange={e => handleNestedChange(catalogKey, subKey, 'mainColorName', e.target.value)} 
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Por defecto: "Ver Colección"</span>
            </div>

            {/* Subida o URL de Imagen */}
            <div style={{ flex: '2 1 300px' }}>
              <label className={styles.label} style={{ fontSize: '0.8rem' }}>Foto Principal</label>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                {item.mainImage && (
                  <div style={{ width: '50px', height: '50px', border: '1px solid #e2e8f0', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={item.mainImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                    <label 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: '#0f172a',
                        color: '#ffffff',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: isUploadingImage ? 'not-allowed' : 'pointer',
                        border: '1px solid #334155',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => { if (!isUploadingImage) e.currentTarget.style.background = '#1e293b'; }}
                      onMouseLeave={e => { if (!isUploadingImage) e.currentTarget.style.background = '#0f172a'; }}
                    >
                      <Upload size={16} style={{ color: 'var(--contex-green)' }} />
                      <span>{isUploadingImage ? 'Subiendo imagen...' : 'Subir Archivo'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(catalogKey, subKey, e)} 
                        disabled={isUploadingImage}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>o pega un enlace:</span>
                  </div>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="https://ejemplo.com/foto-principal.jpg"
                    value={item.mainImage || ''} 
                    onChange={e => handleNestedChange(catalogKey, subKey, 'mainImage', e.target.value)} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: 'var(--contex-dark)', fontSize: '1.1rem' }}>Tarjetas de Características</h4>
            <button 
              onClick={() => handleAddFeature(catalogKey, subKey)}
              style={{
                background: 'var(--contex-green)',
                color: 'black',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Añadir Tarjeta
            </button>
          </div>
          
          {features.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay tarjetas agregadas. Añade una para comenzar.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((feature: any) => (
              <div key={feature.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <div style={{ flex: 1 }}>
                  <label className={styles.label} style={{ fontSize: '0.8rem' }}>Título de Tarjeta (Ej. Material)</label>
                  <input type="text" className={styles.input} value={feature.label || ''} onChange={e => handleUpdateFeature(catalogKey, subKey, feature.id, 'label', e.target.value)} />
                </div>
                <div style={{ flex: 2 }}>
                  <label className={styles.label} style={{ fontSize: '0.8rem' }}>Valor de Tarjeta (Ej. 100% Algodón)</label>
                  <input type="text" className={styles.input} value={feature.value || ''} onChange={e => handleUpdateFeature(catalogKey, subKey, feature.id, 'value', e.target.value)} />
                </div>
                <button 
                  onClick={() => handleRemoveFeature(catalogKey, subKey, feature.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Eliminar Tarjeta"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* === VARIANTES DE COLOR === */}
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: 'var(--contex-dark)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={18} /> Variantes de Color
            </h4>
            <button 
              onClick={() => handleAddColor(catalogKey, subKey)}
              style={{
                background: 'var(--contex-green)',
                color: 'black',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <Plus size={16} /> Añadir Color
            </button>
          </div>
          
          {(!item.colors || item.colors.length === 0) && (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>No hay colores agregados. Los colores por defecto del código se usarán como fallback.</p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(item.colors || []).map((color: any) => (
              <div key={color.id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                {/* Color preview */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', minWidth: '60px' }}>
                  <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: color.hex || '#ccc', border: '2px solid #e2e8f0' }}></div>
                  <input 
                    type="color" 
                    value={color.hex?.startsWith('#') ? color.hex : '#cccccc'} 
                    onChange={e => handleUpdateColor(catalogKey, subKey, color.id, 'hex', e.target.value)}
                    style={{ width: '50px', height: '24px', border: 'none', cursor: 'pointer', padding: 0 }}
                  />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label className={styles.label} style={{ fontSize: '0.8rem' }}>Nombre del Color</label>
                  <input type="text" className={styles.input} value={color.name || ''} onChange={e => handleUpdateColor(catalogKey, subKey, color.id, 'name', e.target.value)} placeholder="Ej. Azul Bebé" />
                </div>
                
                <div style={{ flex: 2 }}>
                  <label className={styles.label} style={{ fontSize: '0.8rem' }}>Imagen del Color</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {color.image && (
                      <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                        <img src={color.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <label 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            background: '#0f172a',
                            color: '#ffffff',
                            padding: '0.45rem 0.85rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: uploadingColorId === color.id ? 'not-allowed' : 'pointer',
                            border: '1px solid #334155',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => { if (uploadingColorId !== color.id) e.currentTarget.style.background = '#1e293b'; }}
                          onMouseLeave={e => { if (uploadingColorId !== color.id) e.currentTarget.style.background = '#0f172a'; }}
                        >
                          <Upload size={14} style={{ color: 'var(--contex-green)' }} />
                          <span>{uploadingColorId === color.id ? 'Subiendo...' : 'Subir Archivo'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleColorImageUpload(catalogKey, subKey, color.id, e)} 
                            disabled={uploadingColorId === color.id}
                            style={{ display: 'none' }} 
                          />
                        </label>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>o URL:</span>
                      </div>
                      <input 
                        type="text" 
                        className={styles.input} 
                        value={color.image || ''} 
                        onChange={e => handleUpdateColor(catalogKey, subKey, color.id, 'image', e.target.value)} 
                        placeholder="https://ejemplo.com/foto-color.jpg" 
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleRemoveColor(catalogKey, subKey, color.id)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '1.5rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Eliminar Color"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarTitle}>CONTEX Admin</div>
        <div 
          className={`${styles.menuItem} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Gestión de Contenidos
        </div>
        <div 
          className={`${styles.menuItem} ${activeTab === 'mainCatalog' ? styles.active : ''}`}
          onClick={() => setActiveTab('mainCatalog')}
        >
          Portafolio Principal
        </div>
        <div 
          className={`${styles.menuItem} ${activeTab === 'kidsCatalog' ? styles.active : ''}`}
          onClick={() => setActiveTab('kidsCatalog')}
        >
          Portafolio Infantil
        </div>
        <div style={{ marginTop: 'auto' }}>
           <button className={styles.logoutBtn} style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={handleLogout}>
             Cerrar Sesión
           </button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1>Editor de Contenidos</h1>
          <div>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            {saveStatus && <span className={styles.statusMessage}>{saveStatus}</span>}
          </div>
        </div>

        {/* --- INICIO (GENERAL) --- */}
        {activeTab === 'general' && (
          <>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Sección: Inicio (Portafolio)</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título Principal</label>
                <input type="text" className={styles.input} value={content.hero?.title || ''} onChange={e => handleChange('hero', 'title', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Subtítulo descriptivo</label>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={content.hero?.subtitle || ''} 
                    onChange={(value) => handleChange('hero', 'subtitle', value)}
                  />
                </div>
              </div>
            </div>

            {/* --- QUIÉNES SOMOS --- */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Sección: Quiénes Somos</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título</label>
                <input type="text" className={styles.input} value={content.about?.title || ''} onChange={e => handleChange('about', 'title', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Contenido Principal (Editor Enriquecido)</label>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={content.about?.bodyHtml || ''} 
                    onChange={(value) => handleChange('about', 'bodyHtml', value)}
                    style={{ minHeight: '200px' }}
                  />
                </div>
              </div>
            </div>
            
            {/* --- POR QUÉ ELEGIRNOS --- */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Sección: ¿Por qué elegirnos? (Tarjetas)</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título Principal</label>
                <input type="text" className={styles.input} value={content.valueProposition?.title || ''} onChange={e => handleChange('valueProposition', 'title', e.target.value)} />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                  <label className={styles.label}>Tarjeta 1</label>
                  <input type="text" className={styles.input} placeholder="Título" value={content.valueProposition?.card1Title || ''} onChange={e => handleChange('valueProposition', 'card1Title', e.target.value)} style={{ marginBottom: '1rem' }} />
                  <textarea className={styles.textarea} placeholder="Descripción" value={content.valueProposition?.card1Desc || ''} onChange={e => handleChange('valueProposition', 'card1Desc', e.target.value)} style={{ minHeight: '80px' }} />
                </div>
                
                <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                  <label className={styles.label}>Tarjeta 2</label>
                  <input type="text" className={styles.input} placeholder="Título" value={content.valueProposition?.card2Title || ''} onChange={e => handleChange('valueProposition', 'card2Title', e.target.value)} style={{ marginBottom: '1rem' }} />
                  <textarea className={styles.textarea} placeholder="Descripción" value={content.valueProposition?.card2Desc || ''} onChange={e => handleChange('valueProposition', 'card2Desc', e.target.value)} style={{ minHeight: '80px' }} />
                </div>
                
                <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                  <label className={styles.label}>Tarjeta 3</label>
                  <input type="text" className={styles.input} placeholder="Título" value={content.valueProposition?.card3Title || ''} onChange={e => handleChange('valueProposition', 'card3Title', e.target.value)} style={{ marginBottom: '1rem' }} />
                  <textarea className={styles.textarea} placeholder="Descripción" value={content.valueProposition?.card3Desc || ''} onChange={e => handleChange('valueProposition', 'card3Desc', e.target.value)} style={{ minHeight: '80px' }} />
                </div>
                
                <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px' }}>
                  <label className={styles.label}>Tarjeta 4</label>
                  <input type="text" className={styles.input} placeholder="Título" value={content.valueProposition?.card4Title || ''} onChange={e => handleChange('valueProposition', 'card4Title', e.target.value)} style={{ marginBottom: '1rem' }} />
                  <textarea className={styles.textarea} placeholder="Descripción" value={content.valueProposition?.card4Desc || ''} onChange={e => handleChange('valueProposition', 'card4Desc', e.target.value)} style={{ minHeight: '80px' }} />
                </div>
              </div>
            </div>

            {/* --- CONTACTO --- */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Sección: Contacto</h2>
              <div className={styles.formGroup}>
                <label className={styles.label}>Título</label>
                <input type="text" className={styles.input} value={content.contact?.title || ''} onChange={e => handleChange('contact', 'title', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Subtítulo</label>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                  <ReactQuill 
                    theme="snow" 
                    value={content.contact?.subtitle || ''} 
                    onChange={(value) => handleChange('contact', 'subtitle', value)}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Correo Electrónico</label>
                <input type="email" className={styles.input} value={content.contact?.email || ''} onChange={e => handleChange('contact', 'email', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Teléfono</label>
                <input type="text" className={styles.input} value={content.contact?.phone || ''} onChange={e => handleChange('contact', 'phone', e.target.value)} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Dirección Física</label>
                <input type="text" className={styles.input} value={content.contact?.address || ''} onChange={e => handleChange('contact', 'address', e.target.value)} />
              </div>
            </div>
          </>
        )}

        {/* --- CATÁLOGO PRINCIPAL --- */}
        {activeTab === 'mainCatalog' && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Módulo: Portafolio Principal</h2>
              <button 
                onClick={() => handleAddCollection('mainCatalog')}
                style={{ background: 'var(--contex-dark)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Nueva Colección
              </button>
            </div>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Modifica los textos descriptivos y características técnicas de cada colección del catálogo físico.</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              {Object.keys(content.mainCatalog || {}).map(key => (
                <button 
                  key={key}
                  onClick={() => setActiveMainProduct(key)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeMainProduct === key ? 'var(--contex-dark)' : '#f1f5f9',
                    color: activeMainProduct === key ? 'white' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: activeMainProduct === key ? 'bold' : 'normal',
                    fontSize: '0.85rem'
                  }}
                >
                  {content.mainCatalog[key].title || key}
                </button>
              ))}
            </div>

            {activeMainProduct && content.mainCatalog?.[activeMainProduct] && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => handleDeleteCollection('mainCatalog', activeMainProduct)}
                    style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Trash2 size={16} /> Eliminar Colección Actual
                  </button>
                </div>
                {renderCatalogEditor('mainCatalog', activeMainProduct, content.mainCatalog[activeMainProduct].title || activeMainProduct)}
              </>
            )}
          </div>
        )}

        {/* --- CATÁLOGO INFANTIL --- */}
        {activeTab === 'kidsCatalog' && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Módulo: Portafolio Infantil (Telary Kids)</h2>
              <button 
                onClick={() => handleAddCollection('kidsCatalog')}
                style={{ background: 'var(--contex-dark)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Nuevo Personaje
              </button>
            </div>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Modifica los textos de la colección infantil.</p>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              {Object.keys(content.kidsCatalog || {}).map(key => (
                <button 
                  key={key}
                  onClick={() => setActiveKidsProduct(key)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    border: 'none',
                    background: activeKidsProduct === key ? 'var(--contex-dark)' : '#f1f5f9',
                    color: activeKidsProduct === key ? 'white' : '#64748b',
                    cursor: 'pointer',
                    fontWeight: activeKidsProduct === key ? 'bold' : 'normal',
                    fontSize: '0.85rem'
                  }}
                >
                  {content.kidsCatalog[key].title || key}
                </button>
              ))}
            </div>

            {activeKidsProduct && content.kidsCatalog?.[activeKidsProduct] && (
              <>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                  <button 
                    onClick={() => handleDeleteCollection('kidsCatalog', activeKidsProduct)}
                    style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '0.3rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Trash2 size={16} /> Eliminar Personaje Actual
                  </button>
                </div>
                {renderCatalogEditor('kidsCatalog', activeKidsProduct, content.kidsCatalog[activeKidsProduct].title || activeKidsProduct)}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
