import { AppModule } from './app.module';
import { ElectionsModule } from './elections/elections.module';
import { VotesModule } from './votes/votes.module';

describe('AppModule', () => {
  it('should register the election and voting modules', () => {
    const imports = (AppModule as any).imports ?? [];

    expect(imports).toContain(ElectionsModule);
    expect(imports).toContain(VotesModule);
  });
});
