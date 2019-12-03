#include <cstring>
#include <iostream>
#include "vector2.h"

Vector *createVector(){
    Vector *v = new Vector();
    v->size = 0;
    v->capacity = 0;
    v->data = NULL;
}

void deleteVector(Vector *v){
    delete[] v->data;
    delete v;
}

Vector *copyVector(Vector *v) {
    Vector *nv = new Vector();
    nv->size = v->size;
    nv->capacity = v->capacity;
    nv->data = new int[v->capacity];
    std::memcpy(nv->data, v->data, v->size * sizeof(int));
    return nv;
}

void swapVector(Vector *lh, Vector *rh) {
    Vector *buf = copyVector(rh);

    rh->size = lh->size;
    rh->capacity = lh->capacity;
    delete[] rh->data;
    rh->data = new int[lh->capacity];
    std::memcpy(rh->data, lh->data, lh->size * sizeof(int));

    lh->size = buf->size;
    lh->capacity = buf->capacity;
    delete[] buf->data;
    lh->data = new int[buf->capacity];
    std::memcpy(lh->data, buf->data, buf->size * sizeof(int));
}

int getValue(Vector *v, size_t index) {
    return v->data[index];
}

size_t getSize(Vector *v) {
    return v->size;
}

size_t getCapacity(Vector *v) {
    return v->capacity;
}

void clear(Vector *v) {
    v->size = 0;
}

void append(Vector *v, int value){
    reserve(v, v->size + 1);
    v->data[v->size] = value;
    v->size += 1;
}

void append(Vector *v, int *arr, size_t count) {
    for(size_t i = 0; i < count; i++)
        append(v, arr[i]);
}

void reserve(Vector *v, size_t capacity) {
    if(capacity <= v->capacity) return;

    if(v->data == NULL) {
        v->data = new int[capacity];
        v->capacity = capacity;
        return;
    }

    int *new_data = new int[capacity];

    std::memcpy(new_data, v->data, v->size * sizeof(int));

    delete[] v->data;

    v->data = new_data;
    v->capacity = capacity;
}

void print(Vector *v) {
    for(size_t i = 0; i < v->size; i++) {
        if(i > 0) std::cout << ", ";
        std::cout << v->data[i];
    }
    std::cout << std::endl;
}

void squeeze(Vector *v) {
    int *new_data = new int[v->size];
    std::memcpy(new_data, v->data, v->size * sizeof(int));
    delete[] v->data;
    v->data = new_data;
    v->capacity = v->size;
}
