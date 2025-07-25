'use client';

import SwipeDeck from '../../components/SwipeDeck';
import { sampleVillas } from '../../utils/helpers';

export default function VillasPage() {
  return (
    <div className="w-full h-screen overflow-hidden fixed inset-0">
      <SwipeDeck villas={sampleVillas} />
    </div>
  );
}
