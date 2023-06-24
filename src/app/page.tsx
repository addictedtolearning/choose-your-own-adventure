'use client';

import { useImmer } from 'use-immer';
import Image from 'next/image'
import styles from './page.module.css'
import { useEffect, useState } from 'react';
import LetterButton from './LetterButton';
import { Scenario, Option } from '@/types';
import Spinner from './Spinner';

export default function Home() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const newScenario = () => {
    setLoading(true);
    fetch('/api/scenario').then(res => res.json()).then(data => {
      setScenario(data);
      setScenarios([data]);
      setLoading(false);
    })
  };

  function chooseOption(option: Option) {
    if (!scenario)
      throw new Error("No scenario?");
    var newScenario = { ...scenario, chosenOption: option }
    var newScenarios = scenarios.slice();
    newScenarios[scenarios.length - 1] = newScenario;
    setScenario(null);
    setScenarios(newScenarios);

    const body = {
      scenarios: newScenarios,
    }
    setLoading(true);
    fetch('/api/scenario', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(res => res.json()).then((newScenario: Scenario) => {
      setScenario(newScenario);
      setScenarios([newScenario, ...newScenarios])
      setLoading(false);
    })
  }

  useEffect(newScenario, []);

  return (
    <main className={styles.main}>
      <h1 className={styles.heading}>CYOA</h1>
      <div className={styles.scenarioList}>
        {scenarios.map((scenario: Scenario, idx: number) =>
          <div key={idx} className={styles.scenario}>
            <p>
              {scenario.description}
            </p>
            <div className={styles.optionButtonList}>
              {scenario.options.map((option: any, idx: number) => {
                var classes = '';
                classes += styles.optionButton + ' ';
                if (scenario.chosenOption === option) {
                  classes += styles.optionButtonSelected;
                }
                return <button key={idx} className={classes}
                  onClick={() => chooseOption(option)}
                  disabled={!!scenario.chosenOption}
                >
                  {option}
                </button>
              }
              )}
            </div>
          </div>
        )}
      </div>
      <Spinner loading={loading}/>
    </main>
  )

}
