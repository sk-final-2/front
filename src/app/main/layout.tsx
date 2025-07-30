const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko">
      <body className={`antialiased`}>{children}</body>
    </html>
  );
};

export default MainLayout;
