'use client'
import React from 'react';
import { Check } from "lucide-react";

const Steps = ({ steps, currentStep }) => {
  return (
    <div className="relative">
      <div className="absolute top-5 left-1 right-1 h-0.5 bg-gray-200">
        <div
          className="absolute h-full bg-primary transition-all duration-500"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />
      </div>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > index;
          const isCurrent = currentStep === index;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center
                    ${isCompleted ? 'border-primary bg-primary text-white' : 
                      isCurrent ? 'border-primary text-primary' : 
                      'border-gray-300 text-gray-300'}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-center">
                <div className={`text-sm font-medium
                  ${isCompleted || isCurrent ? 'text-primary' : 'text-gray-500'}`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1
                  ${isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'}`}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Steps;