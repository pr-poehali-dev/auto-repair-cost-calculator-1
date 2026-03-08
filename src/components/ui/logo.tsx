interface LogoProps {
  isCollapsed?: boolean;
}

const Logo = ({ isCollapsed = false }: LogoProps) => {
  if (isCollapsed) {
    return (
      <a href="/" className="flex items-center justify-center group">
        <img 
          src="https://cdn.poehali.dev/files/3dd3af2d-1667-46a5-a4f1-273d18dcf9df.png" 
          alt="Business Market" 
          className="h-10 w-auto object-contain"
        />
      </a>
    );
  }

  return (
    <a href="/" className="flex items-center justify-center px-2">
      <img 
        src="https://cdn.poehali.dev/files/3dd3af2d-1667-46a5-a4f1-273d18dcf9df.png" 
        alt="Business Market" 
        className="h-24 w-auto object-contain"
      />
    </a>
  );
};

export default Logo;