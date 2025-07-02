import { useState, useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const EmojiPicker = ({ onSelect }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onSelect(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onSelect]);

  return (
    <div ref={pickerRef}>
      <Picker
        data={data}
        onEmojiSelect={onSelect}
        theme="light"
        previewPosition="none"
        searchPosition="none"
        skinTonePosition="none"
      />
    </div>
  );
};

export default EmojiPicker;