"use client"
import React, { useEffect } from 'react';
import { inspectModel } from '../utils/inspectModel';

const ModelInspector = () => {
  useEffect(() => {
    const getModelSummary = async () => {
      await inspectModel();
    };

    getModelSummary();
  }, []);

  return (
    <div>
      <h1>Model Inspector</h1>
      <p>Check the console for the model summary.</p>
    </div>
  );
};

export default ModelInspector;
