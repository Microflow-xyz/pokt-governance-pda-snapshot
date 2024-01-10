import { Test, TestingModule } from "@nestjs/testing";
import { ScoringModule } from "../scoring.module";



describe('ScoringModule', () => {
    let scoring: ScoringModule;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
        providers: [ScoringModule],
        }).compile();

        scoring = module.get<ScoringModule>(ScoringModule);
    });

    test('Should be defined', () => {
        expect(scoring).toBeDefined();
    });
    
})