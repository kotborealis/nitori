#include <cstring>
#include <iostream>

int *getData();
size_t getSize();
size_t getCapacity();
void append(int);
void append(int*, size_t);
void insert(size_t, int);
void erase(size_t);
size_t indexOf(int);
void reserve(size_t);
void squeeze();
void clear();
void print();

int *vector_data = NULL;
size_t vector_size = 0;
size_t vector_capacity = 0;

int *getData() {
    return vector_data;
}

size_t getSize() {
    return vector_size;
}

size_t getCapacity() {
    return vector_capacity;
}

void clear() {
    vector_size = 0;
}

void append(int value){
    reserve(vector_size + 1);
    vector_data[vector_size] = value;
    vector_size += 1;
}

void append(int *arr, size_t count) {
    for(size_t i = 0; i < count; i++)
        append(arr[i]);
}

void reserve(size_t capacity) {
    if(capacity <= vector_capacity) return;

    if(vector_data == NULL) {
        vector_data = new int[capacity];
        vector_capacity = capacity;
        return;
    }

    int *new_data = new int[capacity];

    for(size_t i = 0; i < vector_size; i++)
        new_data[i] = vector_data[i];

    delete[] vector_data;

    vector_data = new_data;
    vector_capacity = capacity;
}

void print() {
    for(size_t i = 0; i < vector_size; i++) {
        if(i > 0) std::cout << ", ";
        std::cout << vector_data[i];
    }
    std::cout << std::endl;
}

void squeeze() {
    int *new_data = new int[vector_size];
    std::memcpy(new_data, vector_data, vector_size);
    delete[] vector_data;
    vector_data = new_data;
    vector_capacity = vector_size;
}

void insert(size_t index, int value) {
    if(index >= getSize()) return;

    vector_size++;
    reserve(vector_size);

    for(size_t i = vector_size - 1; i >= index; i--)
        vector_data[i + 1] = vector_data[i];

    vector_data[index] = value;
}

void erase(size_t index) {
    if(index >= getSize()) return;

    for(size_t i = index + 1; i < vector_size; i++)
        vector_data[i - 1] = vector_data[i];

    vector_size--;
}

size_t indexOf(int val) {
    for(size_t i = 0; i < vector_size; i++)
        if(vector_data[i] == val) return i;
    return -1;
}