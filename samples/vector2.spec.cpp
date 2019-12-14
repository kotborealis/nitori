#include "testing.hpp"
#include "vector2.spec.h"

TEST_CASE("vector") {
    SECTION("getSize, clear, getCapacity > getSize, append") {
        Vector *v = createVector();
        clear(v);
        REQUIRE(getSize(v) == 0);
        REQUIRE(getCapacity(v) >= getSize(v));

        for(int i = 0; i < 100; i++) append(v, i);
        REQUIRE(getSize(v) == 100);
        REQUIRE(getCapacity(v) >= getSize(v));
        for(int i = 0; i < 100; i++) REQUIRE(getValue(v, i) == i);
        deleteVector(v);
    }

    SECTION("reserve"){
        Vector *v = createVector();
        clear(v);
        squeeze(v);

        reserve(v, 10);
        append(v, 10);
        REQUIRE(getValue(v, 0) == 10);

        reserve(v, 100);
        REQUIRE(getValue(v, 0) == 10);
        deleteVector(v);
    }

    SECTION("print") {
        nitori::hijack_stdout();

        Vector *v = createVector();
        clear(v);
        append(v, 10);
        append(v, 11);
        append(v, 12);
        append(v, 13);
        print(v);

        REQUIRE(nitori::stdout() == "10, 11, 12, 13");
        deleteVector(v);
    }

    SECTION("squeeze") {
        Vector *v = createVector();
        clear(v);
        reserve(v, 100);
        squeeze(v);

        REQUIRE(getCapacity(v) == 0);

        clear(v);
        reserve(v, 100);
        for(size_t i = 0; i < 50; i++) append(v, i);
        squeeze(v);

        REQUIRE(getCapacity(v) == 50);
        deleteVector(v);
    }

    SECTION("append") {
        Vector *v = createVector();
        clear(v);
        int arr[] = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90};
        append(v, arr, 10);
        for(size_t i = 0; i < 10; i++) REQUIRE(getValue(v, i) == arr[i]);
        deleteVector(v);
    }

    SECTION("insert") {
        Vector *v = createVector();
        clear(v);
        int arr[] = {0, 1, 2, 3, /*4, */5, 6, 7, 8, 9};
        append(v, arr, 9);

        insert(v, 4, 4);
        for(size_t i = 0; i < 10; i++) REQUIRE(getValue(v, i) == i);
        deleteVector(v);
    }

    SECTION("erase") {
        Vector *v = createVector();
        clear(v);
        int arr1[] = {0, 1, 2, 3, 4,     5, 6, 7, 8, 9};
        int arr2[] = {0, 1, 2, 3, /*4, */5, 6, 7, 8, 9};

        append(v, arr1, 10);
        erase(v, 4);

        for(size_t i = 0; i < 9; i++) REQUIRE(getValue(v, i) == arr2[i]);
        deleteVector(v);
    }

    SECTION("indexOf") {
        Vector *v = createVector();
        clear(v);
        int arr[] = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90};
        append(v, arr, 10);

        REQUIRE(indexOf(v, 100) == -1);
        REQUIRE(indexOf(v, 0) == 0);
        REQUIRE(indexOf(v, 10) == 1);
        REQUIRE(indexOf(v, 50) == 5);
        deleteVector(v);
    }

    SECTION("copy") {
        Vector *v = createVector();
        clear(v);
        append(v, 1);
        append(v, 2);
        append(v, 3);

        Vector *copy = copyVector(v);
        REQUIRE(getValue(v, 0) == getValue(copy, 0));
        REQUIRE(getValue(v, 1) == getValue(copy, 1));
        REQUIRE(getValue(v, 2) == getValue(copy, 2));
    }

    SECTION("swap") {
        Vector *v1 = createVector();
        clear(v1);
        append(v1, 1);
        append(v1, 2);
        append(v1, 3);

        Vector *v2 = createVector();
        clear(v2);
        append(v2, 10);
        append(v2, 20);
        append(v2, 30);
    }
}