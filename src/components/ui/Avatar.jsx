const Avatar = ({
  src,
  alt = '',
  size = 'md',
  status = 'offline',
  hasBorder = false,
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500'
  };
  const borderClass = hasBorder ? 'border-2 border-white' : '';

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src || '/default-avatar.png'}
        alt={alt}
        className={`${sizeClasses[size]} ${borderClass} rounded-full object-cover`}
      />
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ${statusClasses[status]} ring-2 ring-white ${size === 'xs' ? 'h-1.5 w-1.5' : 'h-2.5 w-2.5'}`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;