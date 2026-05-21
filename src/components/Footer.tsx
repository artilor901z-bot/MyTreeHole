export default function Footer() {
  return (
    <footer className="site-footer">
      <div>※</div>
      <div style={{ marginTop: 10 }}>
        my tree hole · 自留地 · {new Date().getFullYear()}
      </div>
    </footer>
  );
}
