import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from 'components';
import { SceneProps } from 'features/trivia/triviaSlice';

export const Scene2 = ({ state, broadcast }: SceneProps) => {
  const [submitted, setSubmitted] = useState(false);
  return (
    <section>
      <h2>{state.question}</h2>
      {state.submissions.map(submission => {
        return (
          <EndorsementButtons
            key={submission.id}
            disabled={submitted}
            onClick={() => {
              broadcast('endorse', {
                name: localStorage.getItem('name'),
                submission_id: submission.id
              });
              setSubmitted(true);
            }}
          >
            {submission.content}
          </EndorsementButtons>
        );
      })}
    </section>
  );
};

const EndorsementButtons = styled(Button)`
  text-transform: uppercase;
`;