/** All API responses are wrapped in a `{ data }` envelope. */
export interface ApiEnvelope<T> {
  data: T;
}
