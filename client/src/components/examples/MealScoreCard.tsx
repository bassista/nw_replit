import MealScoreCard from '../MealScoreCard';

export default function MealScoreCardExample() {
  return (
    <div className="p-4 space-y-4">
      <MealScoreCard 
        grade="A+"
        explanation="Eccellente bilanciamento dei macronutrienti e ottima varietà di alimenti. Continua così!"
        type="day"
      />
      <MealScoreCard 
        grade="B"
        explanation="Buon pasto, ma potrebbe beneficiare di più proteine e meno carboidrati."
        type="meal"
      />
    </div>
  );
}
