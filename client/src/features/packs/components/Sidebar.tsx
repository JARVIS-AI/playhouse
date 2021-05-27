import styled from "styled-components";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { useAlert } from "react-alert";
import ReactTooltip from "react-tooltip";
import { gql, useMutation } from "@apollo/client";
import { theme } from "styles/theme";
import { Button, Icon } from "components";

import { SidebarSceneCreateMutation } from "./__generated__/SidebarSceneCreateMutation";
import { SidebarSceneDeleteMutation } from "./__generated__/SidebarSceneDeleteMutation";
import { SidebarPackSceneUpdateMutation } from "./__generated__/SidebarPackSceneUpdateMutation";
import { SidebarPackFragment } from "./__generated__/SidebarPackFragment";

type Props = {
  pack: SidebarPackFragment;
  selectedSceneId?: string;
  selectScene: (scene: any) => void;
  refetch: () => void;
  setSaving: (saving: boolean) => void;
};

export const Sidebar = ({
  pack,
  selectedSceneId,
  selectScene,
  refetch,
  setSaving,
}: Props) => {
  const alert = useAlert();
  const [sceneCreate] = useMutation<SidebarSceneCreateMutation>(SCENE_CREATE);
  const [sceneDelete] = useMutation<SidebarSceneDeleteMutation>(SCENE_DELETE);
  const [packSceneUpdate] = useMutation<SidebarPackSceneUpdateMutation>(
    PACK_SCENE_UPDATE
  );

  const scenes = pack.scenes?.edges;
  const packId = pack.id;

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    setSaving(true);
    const destinationIndex = result.destination.index;
    const draggableId = result.draggableId;

    let before;
    let after;
    if (destinationIndex !== 0 && scenes) {
      before = scenes[destinationIndex];
    }
    if (scenes && destinationIndex !== scenes.length - 1) {
      after = scenes[destinationIndex + 1];
    }

    try {
      await packSceneUpdate({
        variables: {
          input: {
            packId,
            id: draggableId,
            beforeId: before?.node?.id,
            afterId: after?.node?.id,
          },
        },
      });
      await refetch();
      setSaving(false);
    } catch (error) {
      alert.show(error.message);
      setSaving(false);
    }
  };

  const deleteScene = async (sceneId: string, index: number) => {
    setSaving(true);
    try {
      await sceneDelete({
        variables: {
          input: {
            id: sceneId,
            packId,
          },
        },
      });
      await refetch();
      if (sceneId === selectedSceneId) {
        selectScene(scenes![index - 1]?.node?.id);
      }
      setSaving(false);
    } catch (error) {
      alert.show(error.message);
      setSaving(false);
    }
  };

  const addNewScene = async () => {
    setSaving(true);
    try {
      const { data } = await sceneCreate({
        variables: {
          input: {
            packId,
            question: "What's your name?",
            order: (scenes?.length || 0) + 1,
          },
        },
      });
      await refetch();
      selectScene(data?.sceneCreate?.scene.id);
      setSaving(false);
    } catch (error) {
      alert.show(error.message);
      setSaving(false);
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <h3>Scenes:</h3>
      </SidebarHeader>
      <SidebarContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided) => (
              <SidebarContent
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {scenes?.map((edge, index) => {
                  const scene = edge?.node;
                  if (!scene) return null;
                  return (
                    <Draggable
                      key={scene.id}
                      draggableId={scene.id}
                      index={index}
                    >
                      {(provided) => (
                        <QuestionItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          isSelected={selectedSceneId === scene.id}
                          style={{ ...provided.draggableProps.style }}
                        >
                          <div
                            className="left"
                            onClick={() => selectScene(scene.id)}
                          >
                            <div className="type">
                              {scene.questionType.slug}
                            </div>
                          </div>
                          <div
                            className="right"
                            onClick={() => selectScene(scene.id)}
                          >
                            <h3 className="question">{scene.question}</h3>
                          </div>
                          {scenes.length > 1 && (
                            <button
                              className="delete"
                              onClick={() => deleteScene(scene.id, index)}
                            >
                              <Icon icon="trash" />
                            </button>
                          )}
                        </QuestionItem>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </SidebarContent>
            )}
          </Droppable>
        </DragDropContext>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={addNewScene}>Add New Scene</Button>
        <Button onClick={addNewScene} data-tip="Quick add">
          +
        </Button>
        <ReactTooltip effect="solid" place="top" />
      </SidebarFooter>
    </SidebarContainer>
  );
};

Sidebar.fragments = {
  pack: gql`
    fragment SidebarPackFragment on Pack {
      id
      scenes(first: 100) {
        edges {
          node {
            id
            question
            sceneAnswers {
              id
              content
              isCorrect
            }
            instruction
            questionType {
              id
              slug
            }
            answerType {
              id
              slug
            }
          }
        }
      }
    }
  `,
};

const SCENE_CREATE = gql`
  mutation SidebarSceneCreateMutation($input: SceneCreateInput!) {
    sceneCreate(input: $input) {
      scene {
        id
        question
        sceneAnswers {
          id
          content
          isCorrect
        }
        instruction
        questionType {
          id
          slug
        }
        answerType {
          id
          slug
        }
      }
    }
  }
`;

const SCENE_DELETE = gql`
  mutation SidebarSceneDeleteMutation($input: SceneDeleteInput!) {
    sceneDelete(input: $input) {
      scene {
        id
      }
    }
  }
`;

const PACK_SCENE_UPDATE = gql`
  mutation SidebarPackSceneUpdateMutation($input: PackSceneUpdateInput!) {
    packSceneUpdate(input: $input) {
      packScene {
        id
        order
      }
    }
  }
`;

const SidebarContainer = styled.section`
  grid-area: sidebar;
  background: ${theme.ui.background};
  padding: ${theme.spacings(3)};
  display: grid;
  grid-template-rows: max-content auto max-content;
  height: 100%;
  border-right: 1px solid ${theme.ui.backgroundInverse};
`;

const SidebarHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacings(3)};

  h3 {
    margin: 0;
  }

  button {
    padding: ${theme.spacings(1)};
    min-width: 0;
  }
`;

const SidebarContent = styled.section`
  overflow: auto;
  .first-scene-button {
    width: 100%;
    height: 100px;
  }
`;

const SidebarFooter = styled.footer`
  padding: ${theme.spacings(3)} 0 0;
  button {
    min-width: 0;
  }
`;

const QuestionItem = styled.div<{ isSelected: boolean }>`
  position: relative;
  display: flex;
  justify-content: space-between;
  width: 100%;
  border: 2px dotted ${theme.colors.greyLight};
  border-radius: ${theme.ui.borderWavyRadius};
  margin-bottom: ${theme.spacings(3)};
  background-color: ${({ isSelected }) =>
    isSelected ? theme.ui.backgroundGrey : theme.ui.background};

  &:hover .delete {
    display: block;
  }

  .left {
    padding: ${theme.spacings(3)};
  }

  .right {
    width: 100%;
    overflow: hidden;
    padding: ${theme.spacings(3)};
  }

  .question {
    font-size: 24px;
    margin: 0 0 ${theme.spacings(3)};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .type {
    height: fit-content;
    padding: ${theme.spacings(1)};
    border: 2px solid ${theme.ui.borderColor};
    border-radius: ${theme.ui.borderWavyRadius};
    text-transform: uppercase;
  }

  .delete {
    display: none;
    position: absolute;
    right: ${theme.spacings(2)};
    bottom: ${theme.spacings(2)};
  }
`;
