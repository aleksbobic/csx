import "./Comment.scss";

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { ChartPieIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PencilIcon, PhotoIcon } from "@heroicons/react/20/solid";

import PropTypes from "prop-types";
import ReactMarkdown from "react-markdown";
import { RootStoreContext } from "stores/RootStore";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import classNames from "classnames";
import { observer } from "mobx-react";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import { useContext } from "react";

function CommentComponent(props) {
  const store = useContext(RootStoreContext);
  const { colorMode } = useColorMode();

  const editComment = (id) => {
    store.comment.setEditMode(true);
    store.comment.setEditCommentId(id);

    const editedComment = store.core.studyHistory[
      store.core.studyHistoryItemIndex
    ].comments.find((comment) => comment.id === id);

    store.comment.setEditedCommentContent({
      screenshot: editedComment.screenshot,
      chart: editedComment.chart,
      comment: editedComment.comment,
      screenshot_width: editedComment.screenshot_width,
      screenshot_height: editedComment.screenshot_height,
    });
  };

  const renderMarkdownContent = () => (
    <ReactMarkdown
      className="comment"
      remarkPlugins={[remarkGfm]}
      disallowedElements={["img", "a"]}
      style={{ width: "100%" }}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              showLineNumbers={true}
              PreTag="div"
              className={classNames("code-container", {
                light: colorMode === "light",
                dark: colorMode === "dark",
              })}
              useInlineStyles={true}
              customStyle={{
                background: "transparent",
                padding: 0,
                borderRadius: "6px",
                overflow: "scroll",
              }}
              codeTagProps={{
                style: {
                  background:
                    colorMode === "light" ? "blackAlpha.200" : "#00000077",
                  borderRadius: "6px",
                  display: "block",
                },
              }}
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={colorMode === "light" ? "light" : "dark"}
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {props.comment.comment}
    </ReactMarkdown>
  );

  const renderCommentButtons = () => (
    <Flex
      display={store.comment.editMode ? "none" : "initial"}
      height="100%"
      width="69px"
      position="absolute"
      right="10px"
      top="0"
      paddingTop="18px"
      alignItems="start"
    >
      <Tooltip label="Edit comment">
        <IconButton
          size="sm"
          variant="ghost"
          marginRight="5px"
          backgroundColor={colorMode === "light" && "blackAlpha.200"}
          onClick={() => {
            store.track.trackEvent(
              {
                area: "Comment area",
                sub_area: "Comment list",
              },
              {
                item_type: "Button",
              },
              {
                event_type: "Click",
                event_acton: "Edit comment",
                event_value: props.comment.id,
              }
            );

            editComment(props.comment.id);
          }}
          icon={
            <PencilIcon
              style={{
                width: "16px",
                height: "16px",
                opacity: colorMode === "light" && 0.5,
              }}
            />
          }
          opacity="0"
          transition="0.2s all ease-in-out"
          _groupHover={{
            opacity: "1",
            backgroundColor: colorMode === "light" && "blackAlpha.200",
          }}
        />
      </Tooltip>
      <Tooltip label="Delete comment">
        <IconButton
          size="sm"
          variant="ghost"
          onClick={() => {
            store.track.trackEvent(
              {
                area: "Comment area",
                sub_area: "Comment list",
              },
              {
                item_type: "Button",
              },
              {
                event_type: "Click",
                action_type: "Delete comment",
                event_value: props.comment.id,
              }
            );

            store.comment.deleteComment(props.comment.id);
          }}
          backgroundColor={colorMode === "light" && "blackAlpha.200"}
          icon={
            <XMarkIcon
              style={{
                width: "14px",
                height: "14px",
                opacity: colorMode === "light" && 0.5,
              }}
            />
          }
          opacity="0"
          transition="0.2s all ease-in-out"
          _groupHover={{
            opacity: "1",
            backgroundColor: colorMode === "light" && "blackAlpha.200",
          }}
        />
      </Tooltip>
    </Flex>
  );

  return (
    <Box
      backgroundColor={
        props.commentIndex === store.comment.editCommentId
          ? "blue.400"
          : colorMode === "light"
            ? "blackAlpha.300"
            : "whiteAlpha.200"
      }
      opacity={
        !store.comment.editMode
          ? 1
          : props.commentIndex === store.comment.editCommentId
            ? 1
            : 0.3
      }
      borderRadius="8px"
      padding="20px"
      paddingRight="79px"
      width="100%"
      position="relative"
      _last={{
        marginBottom: "10px",
      }}
      role="group"
    >
      {renderMarkdownContent(props.comment)}

      <HStack width="100%">
        <Text fontSize="11px" opacity="0.5" marginTop="6px">
          {props.comment.edited && "Edited: "}
          {props.comment.time}
        </Text>
        <HStack spacing="10px" paddingLeft="20px">
          {props.comment.screenshot && (
            <PhotoIcon
              width="16px"
              height="16px"
              opacity="0.5"
              style={{ marginBottom: "-5px" }}
            />
          )}
          {props.comment.chart && (
            <ChartPieIcon
              style={{
                "--ggs": "0.7",
                opacity: 0.5,
                marginBottom: "2px",
              }}
            />
          )}
        </HStack>
      </HStack>
      {renderCommentButtons(props.commentIndex)}
    </Box>
  );
}

CommentComponent.propTypes = {
  comment: PropTypes.object,
  commentIndex: PropTypes.number,
};

const ObservedCommentComponent = observer(CommentComponent);
export default ObservedCommentComponent;
