import { normalizeDatabaseUrl } from './database-url';

describe('normalizeDatabaseUrl', () => {
  it('adds SSL mode for remote Render Postgres URLs', () => {
    const url =
      'postgresql://coastalyouthparliament_user:secret@dpg-da120bdg1s2s73cn8ofg-a.oregon-postgres.render.com/coastalyouthparliament';

    expect(normalizeDatabaseUrl(url)).toBe(
      'postgresql://coastalyouthparliament_user:secret@dpg-da120bdg1s2s73cn8ofg-a.oregon-postgres.render.com/coastalyouthparliament?sslmode=require',
    );
  });

  it('keeps local development URLs unchanged', () => {
    const url = 'postgresql://postgres:password@localhost:5432/cyp_db?schema=public';

    expect(normalizeDatabaseUrl(url)).toBe(url);
  });
});
