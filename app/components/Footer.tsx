export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'rgba(20, 20, 22, 0.95)',
      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
      color: 'rgba(255, 255, 255, 0.6)',
      fontSize: '0.9rem'
    }}>
      <p>&copy; {currentYear} CONTEX Compañía Nacional de Textiles S.A.S. Todos los derechos reservados.</p>
    </footer>
  );
}
