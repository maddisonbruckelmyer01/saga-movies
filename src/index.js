import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App/App.js';
import registerServiceWorker from './registerServiceWorker';
import { createStore, combineReducers, applyMiddleware } from 'redux';
// Provider allows us to use redux within our react app
import { Provider } from 'react-redux';
import logger from 'redux-logger';
import { takeEvery, put } from 'redux-saga/effects';
import axios from 'axios';
// Import saga middleware
import createSagaMiddleware from 'redux-saga';

// Create the rootSaga generator function
function* rootSaga() {
    yield takeEvery('FETCH_MOVIES', fetchMovies);
    yield takeEvery('FETCH_DETAILS', fetchDetails);
    yield takeEvery('FETCH_GENRES', fetchGenres);
    yield takeEvery('CHANGE_MOVIE', changeMovie);
}

function* changeMovie (action) {
    try {
        yield axios.put(`/api/movies/update/${action.payload.movie_id}`, action.payload)
        yield put({
            type: 'FETCH_MOVIES'
        })
    }catch(error) {
        console.log('error updating movie', error )
    }
}

function* fetchGenres(action) {
    try {
        let response = yield axios.get(`/api/genres/${action.payload}`)
        console.log('fetch genres response', response)
        yield put({
            type: 'SET_GENRES',
            payload: response.data
        })
    } catch (error) {
        console.log('Could not get current genres:', error);
    }
}

function* fetchDetails(action) {
    try {
        let response = yield axios.get(`/api/movies/details/${action.payload}`)
        console.log('fetch details response', response)
        yield put ({
            type: 'SET_DETAILS',
            payload: response.data
        })
    }catch (error){
        console.log(error);
    }
}

function* fetchMovies(action) {
    try {
        let response = yield axios.get('/api/movies')
        yield put ({
            type: 'SET_MOVIES',
            payload: response.data
        })
    }catch(error){
        console.log(error)
    }
}


// Create sagaMiddleware
const sagaMiddleware = createSagaMiddleware();

// Used to store movies returned from the server

//details reducer
const details = (state = [], action) => {
    switch(action.type) {
        case 'SET_DETAILS':
            return action.payload;
        default:
            return state;
    }
}

const movies = (state = [], action) => {
    switch (action.type) {
        case 'SET_MOVIES':
            return action.payload;
        default:
            return state;
    }
}

// Used to store the movie genres
const genres = (state = [], action) => {
    switch (action.type) {
        case 'SET_GENRES':
            return action.payload;
        default:
            return state;
    }
}

// Create one store that all components can use
const storeInstance = createStore(
    combineReducers({
        movies,
        genres,
        details
    }),
    // Add sagaMiddleware to our store
    applyMiddleware(sagaMiddleware, logger),
);

// Pass rootSaga into our sagaMiddleware
sagaMiddleware.run(rootSaga);

ReactDOM.render(<Provider store={storeInstance}><App /></Provider>, 
    document.getElementById('root'));
registerServiceWorker();
