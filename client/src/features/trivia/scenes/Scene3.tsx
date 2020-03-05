import React from 'react';
import { Button } from 'components';
import { SceneProps } from 'features/trivia/triviaSlice';
import { hashCode } from 'utils/stringUtils';
import { Question } from 'features/trivia/components/Question';
import { SubmissionsContainer } from 'features/trivia/components/SubmissionsContainer';
import correctSvg from 'features/trivia/components/correct.svg';

export const Scene3Remote = ({ state, broadcast }: SceneProps) => {
  return (
    <section>
      <h2>{state.question}</h2>
      <SubmissionsContainer>
        {state.submissions.map(submission => {
          const isRightAnswer = submission.content === state.answer;
          return (
            <div className="submission full" key={submission.id}>
              {isRightAnswer && (
                <img
                  className="correct"
                  src={correctSvg}
                  alt="Correct answer"
                />
              )}
              <Button disabled>{submission.content}</Button>
              <div className="endorsement-container">
                {submission.endorsers.map(endorser => {
                  const avatar = hashCode(endorser.name, 10);
                  return (
                    <div className="endorsement" key={endorser.id}>
                      <img src={`/avatars/${avatar}.svg`} alt={endorser.name} />
                      {endorser.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </SubmissionsContainer>
      <Button onClick={() => broadcast('scene:next')}>Next</Button>
    </section>
  );
};

export const Scene3TV = ({ state }: SceneProps) => {
  return (
    <section>
      <Question>{state.question}</Question>
      <SubmissionsContainer>
        {state.submissions.map(submission => {
          const isRightAnswer = submission.content === state.answer;
          return (
            <div className="submission" key={submission.id}>
              {isRightAnswer && (
                <img
                  className="correct"
                  src={correctSvg}
                  alt="Correct answer"
                />
              )}
              <Button disabled>{submission.content}</Button>
              <div className="endorsement-container">
                {submission.endorsers.map(endorser => {
                  const avatar = hashCode(endorser.name, 10);
                  return (
                    <div className="endorsement" key={endorser.id}>
                      <img src={`/avatars/${avatar}.svg`} alt={endorser.name} />
                      {endorser.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </SubmissionsContainer>
    </section>
  );
};