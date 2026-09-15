"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import styles from './Admin.module.css';
import { Plus, Trash2, X, Upload, Palette, Eye, Undo2, CheckCircle2, AlertCircle, Save, Image as ImageIcon, GripVertical } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

import Hero from '../components/Hero';
import AboutUs from '../components/AboutUs';
import ValueProposition from '../components/ValueProposition';
import ContactSection from '../components/ContactSection';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

// Helper component for Drag and Drop Uploader
const ImageUploader = ({ onUpload, onRemove, currentImage, currentAlt, onAltChange, onUrlChange, isUploading, label = "Subir Imagen", hint = "Formatos JPG/PNG/WebP, Máx 2MB" }: any) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragActive(true);
    else if (e.type === "dragleave") setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const fakeEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onUpload(fakeEvent);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
      {onUrlChange && (
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Pegar URL de imagen HTTP/HTTPS..." 
          value={currentImage || ''} 
          onChange={(e) => onUrlChange(e.target.value)} 
          style={{ fontSize: '0.8rem', marginBottom: '0.2rem' }}
          title="Pega un enlace directo si no quieres subir un archivo"
        />
      )}
      <div 
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        {currentImage ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
             <img src={currentImage} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'contain' }} />
             <div style={{ position: 'absolute', top: -10, right: -10, display: 'flex', gap: '0.5rem' }}>
                <label style={{ background: 'var(--contex-dark)', color: 'white', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} title="Cambiar imagen">
                  <Upload size={14} />
                  <input type="file" accept="image/webp, image/jpeg, image/png" onChange={onUpload} disabled={isUploading} style={{ display: 'none' }} />
                </label>
                {onRemove && (
                  <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }} style={{ background: '#ef4444', color: 'white', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} title="Eliminar imagen">
                    <X size={14} />
                  </button>
                )}
             </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#64748b' }}>
            <ImageIcon size={32} opacity={0.5} />
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{isUploading ? 'Subiendo...' : 'Arrastra una imagen aquí o'}</p>
            {!isUploading && (
              <label style={{ background: '#0f172a', color: '#fff', padding: '0.4rem 1rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.5rem' }}>
                <Upload size={14} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} /> Examinar
                <input type="file" accept="image/webp, image/jpeg, image/png" onChange={onUpload} style={{ display: 'none' }} />
              </label>
            )}
            {hint && <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.7rem', opacity: 0.7 }}>{hint}</p>}
          </div>
        )}
      </div>
      {currentImage && onAltChange && (
        <input 
          type="text" 
          className={styles.input} 
          placeholder="Texto Alt (Ej: Sábanas blancas de algodón para hotel)" 
          value={currentAlt || ''} 
          onChange={(e) => onAltChange(e.target.value)} 
          style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}
          title="Texto alternativo para SEO y accesibilidad"
        />
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [subTab, setSubTab] = useState('hero');
  const [activeMainProduct, setActiveMainProduct] = useState('romana');
  const [activeKidsProduct, setActiveKidsProduct] = useState('chase');
  
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingColorId, setUploadingColorId] = useState<string | null>(null);
  
  const [showPreview, setShowPreview] = useState(false);
  
  const [content, setContent] = useState<any>({
    seo: { title: '', description: '', keywords: '' },
    hero: { title: '', subtitle: '', bgImage: '', alt: '' },
    about: { title: '', bodyHtml: '', image: '', alt: '' },
    featuredPillars: [],
    valueProposition: { title: '', cards: [] },
    contact: { title: '', subtitle: '', email: '', phone: '', address: '' },
    mainCatalog: {},
    kidsCatalog: {}
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Ctrl + S Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, hasUnsavedChanges, isSaving]); // Rebind when these change

  // Before unload warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (!data.mainCatalog) data.mainCatalog = {};
        if (!data.kidsCatalog) data.kidsCatalog = {};
        if (!data.seo) data.seo = { title: '', description: '', keywords: '' };
        if (!data.featuredPillars) data.featuredPillars = [];
        
        if (data.valueProposition && !data.valueProposition.cards) {
          data.valueProposition.cards = [
            { id: '1', title: data.valueProposition.card1Title || '', desc: data.valueProposition.card1Desc || '' },
            { id: '2', title: data.valueProposition.card2Title || '', desc: data.valueProposition.card2Desc || '' },
            { id: '3', title: data.valueProposition.card3Title || '', desc: data.valueProposition.card3Desc || '' },
            { id: '4', title: data.valueProposition.card4Title || '', desc: data.valueProposition.card4Desc || '' },
          ];
        }

        setContent(data);
        setHistory([JSON.stringify(data)]);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error loading content:", err);
        setIsLoading(false);
      });
  }, []);

  const pushHistory = (newContent: any) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    setHistory(prev => {
      const newHistory = [...prev, JSON.stringify(newContent)];
      if (newHistory.length > 15) return newHistory.slice(newHistory.length - 15);
      return newHistory;
    });
  };

  const handleUndo = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current state
      const prev = JSON.parse(newHistory[newHistory.length - 1]);
      setContent(prev);
      setHistory(newHistory);
      setHasUnsavedChanges(true);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (section: string, field: string, value: string) => {
    const newContent = { ...content, [section]: { ...content[section], [field]: value } };
    pushHistory(newContent);
  };

  const handleNestedChange = (section: string, subSection: string, field: string, value: string) => {
    const newContent = {
      ...content,
      [section]: {
        ...content[section],
        [subSection]: {
          ...(content[section][subSection] || {}),
          [field]: value
        }
      }
    };
    pushHistory(newContent);
  };

  const handleAddFeature = (catalogKey: string, subKey: string) => {
    const newContent = { ...content };
    if (!newContent[catalogKey][subKey].features) newContent[catalogKey][subKey].features = [];
    const uniqueId = Math.random().toString(36).substring(2, 9);
    newContent[catalogKey][subKey].features.push({ id: uniqueId, label: '', value: '' });
    pushHistory(newContent);
  };

  const handleUpdateFeature = (catalogKey: string, subKey: string, id: string, field: 'label' | 'value', value: string) => {
    const newContent = { ...content };
    const features = newContent[catalogKey][subKey].features;
    const idx = features.findIndex((f: any) => f.id === id);
    if (idx !== -1) features[idx][field] = value;
    pushHistory(newContent);
  };

  const handleRemoveFeature = (catalogKey: string, subKey: string, id: string) => {
    const newContent = { ...content };
    newContent[catalogKey][subKey].features = newContent[catalogKey][subKey].features.filter((f: any) => f.id !== id);
    pushHistory(newContent);
  };

  const handleAddColor = (catalogKey: string, subKey: string) => {
    const newContent = { ...content };
    if (!newContent[catalogKey][subKey].colors) newContent[catalogKey][subKey].colors = [];
    const uniqueId = Math.random().toString(36).substring(2, 9);
    newContent[catalogKey][subKey].colors.push({ id: uniqueId, name: '', hex: '#cccccc', image: '', alt: '' });
    pushHistory(newContent);
  };

  const handleUpdateColor = (catalogKey: string, subKey: string, id: string, field: 'name' | 'hex' | 'image' | 'alt', value: string) => {
    const newContent = { ...content };
    const colors = newContent[catalogKey][subKey].colors;
    const idx = colors.findIndex((c: any) => c.id === id);
    if (idx !== -1) colors[idx][field] = value;
    pushHistory(newContent);
  };

  const handleRemoveColor = (catalogKey: string, subKey: string, id: string) => {
    const newContent = { ...content };
    newContent[catalogKey][subKey].colors = newContent[catalogKey][subKey].colors.filter((c: any) => c.id !== id);
    pushHistory(newContent);
  };

  const handleDragStart = (e: React.DragEvent, index: number, type: 'features' | 'colors') => {
    e.dataTransfer.setData('dragIndex', index.toString());
    e.dataTransfer.setData('dragType', type);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number, catalogKey: string, subKey: string, type: 'features' | 'colors') => {
    e.preventDefault();
    const dragIndexStr = e.dataTransfer.getData('dragIndex');
    const dragType = e.dataTransfer.getData('dragType');
    
    if (!dragIndexStr || dragType !== type) return;
    
    const dragIndex = parseInt(dragIndexStr, 10);
    if (dragIndex === dropIndex) return;

    const newContent = { ...content };
    const items = [...newContent[catalogKey][subKey][type]];
    const draggedItem = items[dragIndex];
    
    items.splice(dragIndex, 1);
    items.splice(dropIndex, 0, draggedItem);
    
    newContent[catalogKey][subKey][type] = items;
    pushHistory(newContent);
  };

  const handleColorImageUpload = async (catalogKey: string, subKey: string, colorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingColorId(colorId);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        handleUpdateColor(catalogKey, subKey, colorId, 'image', data.url);
      } else {
        showToast("Error: " + data.error, "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    } finally {
      setUploadingColorId(null);
    }
  };

  const handleSettingsImageUpload = async (section: string, field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        handleChange(section, field, data.url);
      } else {
        showToast("Error: " + data.error, "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (catalogKey: string, subKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        if(catalogKey === 'root') {
          handleChange(subKey, 'image', data.url);
        } else if (catalogKey === 'hero') {
          handleChange('hero', 'bgImage', data.url);
        } else {
          handleNestedChange(catalogKey, subKey, 'mainImage', data.url);
        }
      } else {
        showToast("Error: " + data.error, "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCollection = (catalogKey: 'mainCatalog' | 'kidsCatalog') => {
    const name = `collection_${Math.random().toString(36).substring(2, 9)}`;
    if (content[catalogKey][name]) return alert('Ya existe un error de colisión, intenta de nuevo.');
    
    const newContent = { ...content };
    newContent[catalogKey][name] = { title: 'Nueva Colección', features: [] };
    if (catalogKey === 'mainCatalog') setActiveMainProduct(name);
    if (catalogKey === 'kidsCatalog') setActiveKidsProduct(name);
    pushHistory(newContent);
  };

  const handleDeleteCollection = (catalogKey: 'mainCatalog' | 'kidsCatalog', subKey: string) => {
    if (!confirm("¿Eliminar la colección " + subKey + "?")) return;
    const newContent = { ...content };
    delete newContent[catalogKey][subKey];
    const remaining = Object.keys(newContent[catalogKey]);
    if (remaining.length > 0) {
      if (catalogKey === 'mainCatalog') setActiveMainProduct(remaining[0]);
      if (catalogKey === 'kidsCatalog') setActiveKidsProduct(remaining[0]);
    }
    pushHistory(newContent);
  };
  
  const handleAddValueCard = () => {
    const newContent = { ...content };
    if (!newContent.valueProposition.cards) newContent.valueProposition.cards = [];
    newContent.valueProposition.cards.push({ id: Math.random().toString(36).substring(2), title: '', desc: '' });
    pushHistory(newContent);
  };
  
  const handleUpdateValueCard = (id: string, field: string, value: string) => {
    const newContent = { ...content };
    const cards = newContent.valueProposition.cards;
    const idx = cards.findIndex((c: any) => c.id === id);
    if(idx !== -1) cards[idx][field] = value;
    pushHistory(newContent);
  };
  
  const handleRemoveValueCard = (id: string) => {
    const newContent = { ...content };
    newContent.valueProposition.cards = newContent.valueProposition.cards.filter((c: any) => c.id !== id);
    pushHistory(newContent);
  };

  const handleAddPillar = () => {
    const newContent = { ...content };
    newContent.featuredPillars = [...(content.featuredPillars || [])];
    newContent.featuredPillars.push({ 
      id: Math.random().toString(36).substring(2), 
      shortTitle: '', subtitle: '', title: '', description: '', tags: [], color: '#ffffff', number: '00' 
    });
    pushHistory(newContent);
  };
  
  const handleUpdatePillar = (id: string, field: string, value: any) => {
    const newContent = { ...content };
    newContent.featuredPillars = [...(content.featuredPillars || [])];
    const idx = newContent.featuredPillars.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      newContent.featuredPillars[idx] = { ...newContent.featuredPillars[idx], [field]: value };
    }
    pushHistory(newContent);
  };

  const handleUpdatePillarTags = (id: string, tagsString: string) => {
    const newContent = { ...content };
    newContent.featuredPillars = [...(content.featuredPillars || [])];
    const idx = newContent.featuredPillars.findIndex((p: any) => p.id === id);
    if (idx !== -1) {
      newContent.featuredPillars[idx] = { 
        ...newContent.featuredPillars[idx], 
        tags: tagsString.split(',').map(t => t.trim()).filter(t => t !== '') 
      };
    }
    pushHistory(newContent);
  };
  
  const handleRemovePillar = (id: string) => {
    const newContent = { ...content };
    newContent.featuredPillars = (content.featuredPillars || []).filter((p: any) => p.id !== id);
    pushHistory(newContent);
  };

  const getSectionName = () => {
    if (activeTab === 'general') {
      const names: any = { hero: 'Banner Principal', about: 'Quiénes Somos', value: 'Por qué elegirnos', contact: 'Contacto', seo: 'SEO Metadatos' };
      return names[subTab] || 'Gestión de Contenidos';
    }
    if (activeTab === 'mainCatalog') return 'Portafolio Principal';
    if (activeTab === 'kidsCatalog') return 'Portafolio Infantil';
    return 'Panel';
  };

  const handleSave = async () => {
    // Validaciones
    const email = content.contact?.email || '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Por favor, ingresa un correo electrónico válido en Contacto.", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        showToast(`Cambios guardados en ${getSectionName()}`, 'success');
        setHasUnsavedChanges(false);
      } else {
        showToast('Error al guardar.', 'error');
      }
    } catch (err) {
      showToast('Error de conexión.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTabChange = (newTab: string) => {
    if (hasUnsavedChanges) {
      if (!confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres cambiar de módulo perdiendo los cambios?")) {
        return;
      }
    }
    // If they confirm or no unsaved changes, we can discard history
    if (hasUnsavedChanges) {
       setHistory(history.slice(0, 1)); // Reset to first state
       setContent(JSON.parse(history[0])); // Revert
       setHasUnsavedChanges(false);
    }
    setActiveTab(newTab);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isLoading || !isAuthenticated) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>Cargando portal...</div>;
  }

  // SEO Validation Helpers
  const getSeoStatus = (length: number, min: number, max: number) => {
    if (length === 0) return { width: '0%', color: 'var(--contex-dark)', label: 'Vacío' };
    if (length < min) return { width: `${(length/max)*100}%`, color: '#f59e0b', label: 'Muy corto', class: styles.seoWarning };
    if (length <= max) return { width: `${(length/max)*100}%`, color: '#10b981', label: 'Óptimo', class: styles.seoGood };
    return { width: '100%', color: '#ef4444', label: 'Demasiado largo (Google lo cortará)', class: styles.seoError };
  };

  const titleSeo = getSeoStatus(content.seo?.title?.length || 0, 30, 60);
  const descSeo = getSeoStatus(content.seo?.description?.length || 0, 70, 160);

  const renderCatalogEditor = (catalogKey: string, subKey: string, label: string) => {
    const item = content[catalogKey]?.[subKey] || {};
    const features = item.features || [];
    
    return (
      <div style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', backgroundColor: '#f8fafc' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--contex-green)', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>{label}</h3>
        
        <div style={{ marginBottom: '2rem' }}>
          <label className={styles.label}>Título Principal</label>
          <input type="text" className={styles.input} value={item.title || ''} onChange={e => handleNestedChange(catalogKey, subKey, 'title', e.target.value)} />
        </div>

        <div style={{ marginBottom: '2rem', background: 'white', padding: '1.2rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <label className={styles.label} style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem', display: 'block' }}>
            Imagen Principal y Tarjeta Inicial
          </label>
          <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: '70px' }}>
              <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tono</label>
              <div style={{ width: '54px', height: '40px', borderRadius: '6px', background: item.mainColorHex || 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', border: '2px solid #cbd5e1' }}></div>
              <input type="color" value={item.mainColorHex?.startsWith('#') ? item.mainColorHex : '#e2e8f0'} onChange={e => handleNestedChange(catalogKey, subKey, 'mainColorHex', e.target.value)} style={{ width: '54px', height: '26px', border: 'none', cursor: 'pointer', padding: 0 }} />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label className={styles.label} style={{ fontSize: '0.8rem' }}>Nombre de la Tarjeta</label>
              <input type="text" className={styles.input} placeholder="Ver Colección" value={item.mainColorName ?? ''} onChange={e => handleNestedChange(catalogKey, subKey, 'mainColorName', e.target.value)} />
            </div>
            <div style={{ flex: '2 1 300px' }}>
              <label className={styles.label} style={{ fontSize: '0.8rem' }}>Foto Principal</label>
              <ImageUploader 
                currentImage={item.mainImage}
                currentAlt={item.mainAlt}
                onAltChange={(val: string) => handleNestedChange(catalogKey, subKey, 'mainAlt', val)}
                onUpload={(e: any) => handleImageUpload(catalogKey, subKey, e)}
                onUrlChange={(val: string) => handleNestedChange(catalogKey, subKey, 'mainImage', val)}
                isUploading={isUploadingImage}
              />
            </div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: 'var(--contex-dark)', fontSize: '1.1rem' }}>Características</h4>
            <button onClick={() => handleAddFeature(catalogKey, subKey)} style={{ background: 'var(--contex-green)', color: 'black', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Añadir Característica
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((f: any, index: number) => (
              <div 
                key={f.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, index, 'features')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index, catalogKey, subKey, 'features')}
                style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'white', padding: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'grab' }}
              >
                <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginTop: '1.5rem', color: '#94a3b8' }}><GripVertical size={20} /></div>
                <div style={{ flex: 1 }}><label className={styles.label}>Título</label><input type="text" className={styles.input} value={f.label || ''} onChange={e => handleUpdateFeature(catalogKey, subKey, f.id, 'label', e.target.value)} /></div>
                <div style={{ flex: 2 }}><label className={styles.label}>Valor</label><input type="text" className={styles.input} value={f.value || ''} onChange={e => handleUpdateFeature(catalogKey, subKey, f.id, 'value', e.target.value)} /></div>
                <button onClick={() => handleRemoveFeature(catalogKey, subKey, f.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', marginTop: '1.5rem' }}><X size={16} /></button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: 'var(--contex-dark)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Palette size={18} /> Colores</h4>
            <button onClick={() => handleAddColor(catalogKey, subKey)} style={{ background: 'var(--contex-green)', color: 'black', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Plus size={16} /> Añadir Color
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {(item.colors || []).map((c: any, index: number) => (
              <div 
                key={c.id} 
                draggable 
                onDragStart={(e) => handleDragStart(e, index, 'colors')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index, catalogKey, subKey, 'colors')}
                style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'grab' }}
              >
                <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginTop: '2rem', color: '#94a3b8' }}><GripVertical size={20} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
                  <label className={styles.label} style={{marginBottom: 0}}>Color</label>
                  <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '8px', background: c.hex || '#ccc', border: '2px solid #e2e8f0', overflow: 'hidden' }}>
                    <input type="color" value={c.hex?.startsWith('#') ? c.hex : '#cccccc'} onChange={e => handleUpdateColor(catalogKey, subKey, c.id, 'hex', e.target.value)} style={{ position: 'absolute', top: '-10px', left: '-10px', width: '100px', height: '100px', border: 'none', cursor: 'pointer', padding: 0, opacity: 0 }} />
                  </div>
                  <input type="text" className={styles.input} value={c.hex || ''} onChange={e => handleUpdateColor(catalogKey, subKey, c.id, 'hex', e.target.value)} placeholder="#HEX" style={{ width: '80px', textAlign: 'center', fontSize: '0.85rem', padding: '0.3rem' }} />
                </div>
                <div style={{ flex: 1 }}><label className={styles.label}>Nombre de Variante</label><input type="text" className={styles.input} value={c.name || ''} onChange={e => handleUpdateColor(catalogKey, subKey, c.id, 'name', e.target.value)} placeholder="Ej: Oro Champagne" /></div>
                <div style={{ flex: 2 }}>
                  <label className={styles.label}>Archivo de Imagen & Texto Alternativo (Alt)</label>
                  <ImageUploader 
                    currentImage={c.image}
                    currentAlt={c.alt}
                    onAltChange={(val: string) => handleUpdateColor(catalogKey, subKey, c.id, 'alt', val)}
                    onUpload={(e: any) => handleColorImageUpload(catalogKey, subKey, c.id, e)}
                    onUrlChange={(val: string) => handleUpdateColor(catalogKey, subKey, c.id, 'image', val)}
                    isUploading={uploadingColorId === c.id}
                    hint="Imagen de detalle para este color (Opcional)"
                  />
                </div>
                <button onClick={() => handleRemoveColor(catalogKey, subKey, c.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', marginTop: '1.5rem' }}><X size={16} /></button>
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
        <div className={styles.sidebarTitle} style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
          <img src="/logo-contex.png" alt="CONTEX Admin" style={{ maxWidth: '80%', height: 'auto', objectFit: 'contain' }} />
        </div>
        <div className={`${styles.menuItem} ${activeTab === 'general' ? styles.active : ''}`} onClick={() => handleTabChange('general')}>Gestión de Contenidos</div>
        <div className={`${styles.menuItem} ${activeTab === 'mainCatalog' ? styles.active : ''}`} onClick={() => handleTabChange('mainCatalog')}>Portafolio Principal</div>
        <div className={`${styles.menuItem} ${activeTab === 'kidsCatalog' ? styles.active : ''}`} onClick={() => handleTabChange('kidsCatalog')}>Portafolio Infantil</div>
        <div style={{ marginTop: 'auto' }}>
           <button className={styles.logoutBtn} style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'white' }} onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <h1>Editor de Contenidos</h1>
            {hasUnsavedChanges && <span style={{fontSize: '0.8rem', color: '#f59e0b', background: '#fef3c7', padding: '0.3rem 0.6rem', borderRadius: '20px', fontWeight: 'bold', border: '1px solid #f59e0b'}}>Cambios sin guardar</span>}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleUndo} 
              disabled={history.length <= 1}
              style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', cursor: history.length <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: history.length <= 1 ? 0.5 : 1, fontWeight: 'bold', color: '#64748b' }}
            >
              <Undo2 size={18} /> Deshacer
            </button>
            <button 
              onClick={() => setShowPreview(true)}
              style={{ background: '#f1f5f9', color: '#0f172a', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}
            >
              <Eye size={18} /> Previsualizar
            </button>
            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving || !hasUnsavedChanges} title="Guardar cambios (Ctrl+S)">
              <Save size={18} style={{marginRight: '0.4rem', verticalAlign: 'middle'}}/>
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>

        {activeTab === 'general' && (
          <>
            <div className={styles.subTabContainer}>
              <button className={`${styles.subTab} ${subTab === 'hero' ? styles.active : ''}`} onClick={() => setSubTab('hero')}>Inicio (Banners)</button>
              <button className={`${styles.subTab} ${subTab === 'about' ? styles.active : ''}`} onClick={() => setSubTab('about')}>Quiénes Somos</button>
              <button className={`${styles.subTab} ${subTab === 'pillars' ? styles.active : ''}`} onClick={() => setSubTab('pillars')}>Tarjetas</button>
              <button className={`${styles.subTab} ${subTab === 'value' ? styles.active : ''}`} onClick={() => setSubTab('value')}>Por qué elegirnos</button>
              <button className={`${styles.subTab} ${subTab === 'contact' ? styles.active : ''}`} onClick={() => setSubTab('contact')}>Contacto</button>
              <button className={`${styles.subTab} ${subTab === 'seo' ? styles.active : ''}`} onClick={() => setSubTab('seo')}>SEO Metadatos</button>
            </div>

            {subTab === 'hero' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Banner Principal</h2>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Título Principal</label>
                  <input type="text" className={styles.input} value={content.hero?.title || ''} onChange={e => handleChange('hero', 'title', e.target.value)} maxLength={80} />
                  <div style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'right', marginTop: '0.25rem' }}>
                    {content.hero?.title?.length || 0}/50 caracteres recomendados
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Subtítulo descriptivo</label>
                  <div style={{ backgroundColor: 'white', color: 'black' }}>
                    <ReactQuill theme="snow" value={content.hero?.subtitle || ''} onChange={(val) => handleChange('hero', 'subtitle', val)} />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Fondo del Banner</label>
                  <ImageUploader 
                    currentImage={content.hero?.bgImage}
                    currentAlt={content.hero?.alt}
                    onAltChange={(val: string) => handleChange('hero', 'alt', val)}
                    onUpload={(e: any) => handleImageUpload('hero', 'hero', e)}
                    onUrlChange={(val: string) => handleChange('hero', 'bgImage', val)}
                    onRemove={() => handleChange('hero', 'bgImage', '')}
                    isUploading={isUploadingImage}
                    hint="Formatos JPG/PNG/WebP, Máx 2MB. 1920x1080px recomendado"
                  />
                </div>
              </div>
            )}

            {subTab === 'about' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Quiénes Somos</h2>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Título</label>
                  <input type="text" className={styles.input} value={content.about?.title || ''} onChange={e => handleChange('about', 'title', e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Imagen Lateral</label>
                  <div style={{ maxWidth: '400px' }}>
                    <ImageUploader 
                      currentImage={content.about?.image}
                      currentAlt={content.about?.alt}
                      onAltChange={(val: string) => handleChange('about', 'alt', val)}
                      onUpload={(e: any) => handleImageUpload('root', 'about', e)}
                      onUrlChange={(val: string) => handleChange('about', 'image', val)}
                      onRemove={() => handleChange('about', 'image', '')}
                      isUploading={isUploadingImage}
                      hint="Formatos JPG/PNG/WebP, Máx 2MB."
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Contenido Principal</label>
                  <div style={{ backgroundColor: 'white', color: 'black' }}><ReactQuill theme="snow" value={content.about?.bodyHtml || ''} onChange={(val) => handleChange('about', 'bodyHtml', val)} /></div>
                </div>
              </div>
            )}

            {subTab === 'pillars' && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '1rem' }}>
                  <button onClick={handleAddPillar} style={{ background: 'var(--contex-green)', color: 'black', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Plus size={16} /> Añadir Tarjeta
                  </button>
                </div>
                
                <div className={styles.formGroup}>
                  <label className={styles.label}>Título</label>
                  <input type="text" className={styles.input} placeholder="Tejemos calidad que<br /><span>genera impacto.</span>" value={content.featuredPillarsTitle || ''} onChange={e => handleChange('', 'featuredPillarsTitle', e.target.value)} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {(content.featuredPillars || []).map((card: any) => (
                    <div key={card.id} style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', position: 'relative', background: '#f8fafc' }}>
                      <button onClick={() => handleRemovePillar(card.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }} title="Eliminar"><X size={14} /></button>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div>
                          <label className={styles.label}>Número (Marca de agua y subtítulo)</label>
                          <input type="text" className={styles.input} placeholder="Ej: 01" value={card.number || ''} onChange={e => { 
                            const val = e.target.value;
                            const newContent = { ...content };
                            newContent.featuredPillars = [...(content.featuredPillars || [])];
                            const idx = newContent.featuredPillars.findIndex((p: any) => p.id === card.id);
                            if (idx !== -1) {
                              newContent.featuredPillars[idx] = { ...newContent.featuredPillars[idx], number: val, subtitle: val };
                            }
                            pushHistory(newContent);
                          }} />
                        </div>
                        <div>
                          <label className={styles.label}>Color Principal (Hex)</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input type="color" value={card.color || '#cccccc'} onChange={e => handleUpdatePillar(card.id, 'color', e.target.value)} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px' }} />
                            <input type="text" className={styles.input} placeholder="#HEX" value={card.color || ''} onChange={e => handleUpdatePillar(card.id, 'color', e.target.value)} />
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                        <div>
                          <label className={styles.label}>Título en Tarjeta (Corto)</label>
                          <input type="text" className={styles.input} placeholder="Ej: Línea Hogar" value={card.shortTitle || ''} onChange={e => handleUpdatePillar(card.id, 'shortTitle', e.target.value)} />
                        </div>
                        <div>
                          <label className={styles.label}>Título Lateral (Largo)</label>
                          <input type="text" className={styles.input} placeholder="Ej: Experiencia para el descanso" value={card.title || ''} onChange={e => handleUpdatePillar(card.id, 'title', e.target.value)} />
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label className={styles.label}>Descripción</label>
                        <textarea className={styles.textarea} placeholder="Descripción..." value={card.description || ''} onChange={e => handleUpdatePillar(card.id, 'description', e.target.value)} style={{ minHeight: '80px' }} />
                      </div>

                      <div>
                        <label className={styles.label}>Etiquetas (Tags) - Separadas por coma</label>
                        <input type="text" className={styles.input} placeholder="Ej: 100% Algodón, Microfibra, Suavidad" value={(card.tags || []).join(', ')} onChange={e => handleUpdatePillarTags(card.id, e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
                {content.featuredPillars?.length === 0 && <p style={{color: '#64748b', fontStyle: 'italic'}}>No hay tarjetas configuradas. Añade una para empezar.</p>}
              </div>
            )}

            {subTab === 'value' && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h2 className={styles.cardTitle} style={{ margin: 0 }}>¿Por qué elegirnos?</h2>
                  <button onClick={handleAddValueCard} style={{ background: 'var(--contex-green)', color: 'black', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <Plus size={16} /> Añadir Tarjeta
                  </button>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Título Principal</label>
                  <input type="text" className={styles.input} value={content.valueProposition?.title || ''} onChange={e => handleChange('valueProposition', 'title', e.target.value)} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                  {(content.valueProposition?.cards || []).map((card: any) => (
                    <div key={card.id} style={{ border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '8px', position: 'relative', background: '#f8fafc' }}>
                      <button onClick={() => handleRemoveValueCard(card.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', cursor: 'pointer' }} title="Eliminar"><X size={14} /></button>
                      <label className={styles.label}>Título de la tarjeta</label>
                      <input type="text" className={styles.input} placeholder="Ej: Alta Durabilidad" value={card.title || ''} onChange={e => handleUpdateValueCard(card.id, 'title', e.target.value)} style={{ marginBottom: '1rem' }} />
                      <label className={styles.label}>Descripción</label>
                      <textarea className={styles.textarea} placeholder="Descripción..." value={card.desc || ''} onChange={e => handleUpdateValueCard(card.id, 'desc', e.target.value)} style={{ minHeight: '80px' }} />
                    </div>
                  ))}
                </div>
                {content.valueProposition?.cards?.length === 0 && <p style={{color: '#64748b', fontStyle: 'italic'}}>No hay tarjetas configuradas. Añade una para empezar.</p>}
              </div>
            )}

            {subTab === 'contact' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Contacto</h2>
                <div className={styles.formGroup}><label className={styles.label}>Título</label><input type="text" className={styles.input} value={content.contact?.title || ''} onChange={e => handleChange('contact', 'title', e.target.value)} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Subtítulo</label><div style={{ backgroundColor: 'white', color: 'black' }}><ReactQuill theme="snow" value={content.contact?.subtitle || ''} onChange={(v) => handleChange('contact', 'subtitle', v)} /></div></div>
                <div className={styles.formGroup}><label className={styles.label}>Correo Electrónico (Válido)</label><input type="email" className={styles.input} value={content.contact?.email || ''} onChange={e => handleChange('contact', 'email', e.target.value)} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Teléfono</label><input type="text" className={styles.input} value={content.contact?.phone || ''} onChange={e => handleChange('contact', 'phone', e.target.value)} /></div>
                <div className={styles.formGroup}><label className={styles.label}>Dirección Física</label><input type="text" className={styles.input} value={content.contact?.address || ''} onChange={e => handleChange('contact', 'address', e.target.value)} /></div>
              </div>
            )}

            {subTab === 'seo' && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Metadatos SEO</h2>
                <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem'}}>Configura cómo aparecerá tu página web en Google y al compartir enlaces.</p>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Meta Title</label>
                  <input type="text" className={styles.input} value={content.seo?.title || ''} onChange={e => handleChange('seo', 'title', e.target.value)} placeholder="Ej: Contex | Textiles para Hotel" />
                  <div className={styles.seoBar}><div className={`${styles.seoBarFill} ${titleSeo.class}`} style={{width: titleSeo.width}}></div></div>
                  <div className={styles.seoHint}><span>{content.seo?.title?.length || 0} caracteres</span><span>{titleSeo.label} (Ideal: 30-60)</span></div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Meta Description</label>
                  <textarea className={styles.textarea} value={content.seo?.description || ''} onChange={e => handleChange('seo', 'description', e.target.value)} placeholder="Ej: Somos fabricantes de..." />
                  <div className={styles.seoBar}><div className={`${styles.seoBarFill} ${descSeo.class}`} style={{width: descSeo.width}}></div></div>
                  <div className={styles.seoHint}><span>{content.seo?.description?.length || 0} caracteres</span><span>{descSeo.label} (Ideal: 70-160)</span></div>
                </div>
                <div className={styles.formGroup}><label className={styles.label}>Keywords</label><input type="text" className={styles.input} placeholder="toallas, contex, hotel, sábanas" value={content.seo?.keywords || ''} onChange={e => handleChange('seo', 'keywords', e.target.value)} /></div>
              </div>
            )}
          </>
        )}

        {activeTab === 'mainCatalog' && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Módulo: Portafolio Principal</h2>
              <button onClick={() => handleAddCollection('mainCatalog')} style={{ background: 'var(--contex-dark)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Nueva Colección
              </button>
            </div>

            {/* Configuración del Libro (Main) */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--contex-dark)', fontSize: '1.1rem' }}>Configuración del Libro</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Portada</label>
                  <ImageUploader 
                    currentImage={content.mainCatalogSettings?.coverImage}
                    onUpload={(e: any) => handleSettingsImageUpload('mainCatalogSettings', 'coverImage', e)}
                    onUrlChange={(val: string) => handleChange('mainCatalogSettings', 'coverImage', val)}
                    onRemove={() => handleChange('mainCatalogSettings', 'coverImage', '')}
                    isUploading={isUploadingImage}
                    hint="Imagen de portada (Vertical, ej: 800x1200px)"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Contraportada</label>
                  <ImageUploader 
                    currentImage={content.mainCatalogSettings?.backCoverImage}
                    onUpload={(e: any) => handleSettingsImageUpload('mainCatalogSettings', 'backCoverImage', e)}
                    onUrlChange={(val: string) => handleChange('mainCatalogSettings', 'backCoverImage', val)}
                    onRemove={() => handleChange('mainCatalogSettings', 'backCoverImage', '')}
                    isUploading={isUploadingImage}
                    hint="Imagen de contraportada (Vertical, ej: 800x1200px)"
                  />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                <label className={styles.label}>Índice (HTML / Texto Simple)</label>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                  <ReactQuill theme="snow" value={content.mainCatalogSettings?.indexHtml || ''} onChange={(val) => handleChange('mainCatalogSettings', 'indexHtml', val)} />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                <label className={styles.label}>Nuestra Historia (HTML / Texto Simple)</label>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                  <ReactQuill theme="snow" value={content.mainCatalogSettings?.historyHtml || ''} onChange={(val) => handleChange('mainCatalogSettings', 'historyHtml', val)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--contex-dark)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Colecciones</h4>
                {Object.keys(content.mainCatalog || {}).map(key => (
                  <button key={key} onClick={() => setActiveMainProduct(key)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', background: activeMainProduct === key ? 'var(--contex-dark)' : 'transparent', color: activeMainProduct === key ? 'white' : '#64748b', cursor: 'pointer', fontWeight: activeMainProduct === key ? 'bold' : 'normal', fontSize: '0.9rem', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}>
                    {content.mainCatalog[key].title || key}
                  </button>
                ))}
              </div>

              <div>
                {activeMainProduct && content.mainCatalog?.[activeMainProduct] && (
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                      <h3 style={{ margin: 0, color: 'var(--contex-dark)', fontSize: '1.3rem' }}>{content.mainCatalog[activeMainProduct].title || activeMainProduct}</h3>
                      <button onClick={() => handleDeleteCollection('mainCatalog', activeMainProduct)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, transition: 'all 0.2s' }}><Trash2 size={16} /> Eliminar Colección</button>
                    </div>
                    {renderCatalogEditor('mainCatalog', activeMainProduct, content.mainCatalog[activeMainProduct].title || activeMainProduct)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kidsCatalog' && (
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Módulo: Portafolio Infantil (Telary Kids)</h2>
              <button onClick={() => handleAddCollection('kidsCatalog')} style={{ background: 'var(--contex-dark)', color: 'white', padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={16} /> Nuevo Personaje
              </button>
            </div>

            {/* Configuración del Libro (Kids) */}
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: 'var(--contex-dark)', fontSize: '1.1rem' }}>Configuración del Libro</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Portada</label>
                  <ImageUploader 
                    currentImage={content.kidsCatalogSettings?.coverImage}
                    onUpload={(e: any) => handleSettingsImageUpload('kidsCatalogSettings', 'coverImage', e)}
                    onUrlChange={(val: string) => handleChange('kidsCatalogSettings', 'coverImage', val)}
                    onRemove={() => handleChange('kidsCatalogSettings', 'coverImage', '')}
                    isUploading={isUploadingImage}
                    hint="Imagen de portada (Vertical, ej: 800x1200px)"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Contraportada</label>
                  <ImageUploader 
                    currentImage={content.kidsCatalogSettings?.backCoverImage}
                    onUpload={(e: any) => handleSettingsImageUpload('kidsCatalogSettings', 'backCoverImage', e)}
                    onUrlChange={(val: string) => handleChange('kidsCatalogSettings', 'backCoverImage', val)}
                    onRemove={() => handleChange('kidsCatalogSettings', 'backCoverImage', '')}
                    isUploading={isUploadingImage}
                    hint="Imagen de contraportada (Vertical, ej: 800x1200px)"
                  />
                </div>
              </div>
              <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                <label className={styles.label}>Índice (HTML / Texto Simple)</label>
                <div style={{ backgroundColor: 'white', color: 'black' }}>
                  <ReactQuill theme="snow" value={content.kidsCatalogSettings?.indexHtml || ''} onChange={(val) => handleChange('kidsCatalogSettings', 'indexHtml', val)} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem', alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--contex-dark)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Personajes</h4>
                {Object.keys(content.kidsCatalog || {}).map(key => (
                  <button key={key} onClick={() => setActiveKidsProduct(key)} style={{ padding: '0.6rem 1rem', borderRadius: '6px', border: 'none', background: activeKidsProduct === key ? 'var(--contex-dark)' : 'transparent', color: activeKidsProduct === key ? 'white' : '#64748b', cursor: 'pointer', fontWeight: activeKidsProduct === key ? 'bold' : 'normal', fontSize: '0.9rem', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}>
                    {content.kidsCatalog[key].title || key}
                  </button>
                ))}
              </div>

              <div>
                {activeKidsProduct && content.kidsCatalog?.[activeKidsProduct] && (
                  <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                      <h3 style={{ margin: 0, color: 'var(--contex-dark)', fontSize: '1.3rem' }}>{content.kidsCatalog[activeKidsProduct].title || activeKidsProduct}</h3>
                      <button onClick={() => handleDeleteCollection('kidsCatalog', activeKidsProduct)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, transition: 'all 0.2s' }}><Trash2 size={16} /> Eliminar Personaje</button>
                    </div>
                    {renderCatalogEditor('kidsCatalog', activeKidsProduct, content.kidsCatalog[activeKidsProduct].title || activeKidsProduct)}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} style={{color: '#10b981'}} /> : <AlertCircle size={20} style={{color: '#ef4444'}} />}
          <span>{toast.message}</span>
        </div>
      )}

      {showPreview && (
        <div className={styles.previewOverlay}>
          <div className={styles.previewHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <Eye size={24} /> Previsualización en Tiempo Real
            </div>
            <button onClick={() => setShowPreview(false)} style={{ background: 'white', color: 'black', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <X size={18} /> Cerrar Previsualización
            </button>
          </div>
          <div className={styles.previewContainer}>
            <Hero data={content.hero} />
            <AboutUs data={content.about} />
            <ValueProposition data={content.valueProposition} />
            <ContactSection data={content.contact} />
          </div>
        </div>
      )}
    </div>
  );
}
