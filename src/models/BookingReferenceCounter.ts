import { Schema, model, models, type Document } from 'mongoose';

export interface IBookingReferenceCounter extends Document {
  villaId: string;
  date: string; // YYYYMMDD
  seq: number;
}

const BookingReferenceCounterSchema = new Schema<IBookingReferenceCounter>(
  {
    villaId: {
      type: String,
      required: true,
      index: true
    },
    date: {
      type: String,
      required: true,
      index: true
    },
    seq: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

BookingReferenceCounterSchema.index({ villaId: 1, date: 1 }, { unique: true });

export const BookingReferenceCounter =
  models.BookingReferenceCounter ||
  model<IBookingReferenceCounter>('BookingReferenceCounter', BookingReferenceCounterSchema);
