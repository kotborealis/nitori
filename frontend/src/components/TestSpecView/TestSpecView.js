import React from 'react';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Card} from 'react-bootstrap';
import {PrismAsyncLight as SyntaxHighlighter} from 'react-syntax-highlighter';
import {tomorrow} from 'react-syntax-highlighter/dist/esm/styles/prism';

export const TestSpecView = ({_id, name, description, timestamp, sourceFiles}) =>
    <Card>
        <Card.Body>
            <Card.Title>Тест: {name}</Card.Title>
            <Card.Subtitle>Обновлён {formatDistance(new Date(timestamp), new Date, {locale: ru})} назад</Card.Subtitle>
            <Card.Text>
                {sourceFiles.map(({name, data}) =>
                    <div style={{paddingTop: '20px'}}>
                        <i>{name}</i>
                        <SyntaxHighlighter language="cpp" style={tomorrow} showLineNumbers={true}>
                            {data}
                        </SyntaxHighlighter>
                    </div>
                )}
            </Card.Text>
        </Card.Body>
    </Card>;