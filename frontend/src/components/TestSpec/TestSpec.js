import React from 'react';
import {formatDistance} from 'date-fns';
import {ru} from 'date-fns/locale';
import {Card} from 'react-bootstrap';
import {CodeCpp} from '../CodeCpp/CodeCpp';

export const TestSpec = ({_id, name, description, timestamp, sourceFiles}) =>
    <Card>
        <Card.Body>
            <Card.Title>Тест: {name}</Card.Title>
            <Card.Subtitle>Обновлён {formatDistance(new Date(timestamp), new Date, {locale: ru})} назад</Card.Subtitle>
            <Card.Text>
                <p>{description}</p>

                {sourceFiles.map(({name, data}) =>
                    <div style={{paddingTop: '20px'}}>
                        <CodeCpp name={name}>
                            {data}
                        </CodeCpp>
                    </div>
                )}
            </Card.Text>
        </Card.Body>
    </Card>;