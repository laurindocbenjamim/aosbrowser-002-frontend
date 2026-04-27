import React from 'react';
import { useNavigate } from 'react-router-dom';
import PreviewScene from '../components/PreviewScene';

export default function LandingPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen w-screen bg-black flex flex-col items-center justify-center p-4 pt-24">
      <div className="w-full max-w-6xl h-[450px] sm:h-auto sm:aspect-video lg:aspect-[21/9]">
        <PreviewScene 
          layoutId="elegant-dark" 
          onNavigate={(page) => navigate(`/${page}`)} 
        />
      </div>
    </div>
  );
}
