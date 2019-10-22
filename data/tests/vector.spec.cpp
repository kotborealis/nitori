#include "testing.hpp"

int *getData(); //
size_t getSize(); //
size_t getCapacity(); //
void append(int); //
void append(int*, size_t); //
void insert(size_t, int); //
void erase(size_t); //
size_t indexOf(int); //
void reserve(size_t); //
void squeeze(); //
void clear(); //
void print(); //

TEST_CASE("vector") {
    SECTION("getData(), getSize(), clear(), getCapacity() > getSize(), append(int)") {
        clear();
        REQUIRE(getSize() == 0);
        REQUIRE(getCapacity() >= getSize());

        for(int i = 0; i < 100; i++) append(i);
        REQUIRE(getSize() == 100);
        REQUIRE(getCapacity() >= getSize());
        for(int i = 0; i < 100; i++) REQUIRE(getData()[i] == i);
    }

    SECTION("reserve()"){
        clear();
        squeeze();

        reserve(10);
        append(10);
        REQUIRE(getData()[0] == 10);

        reserve(100);
        REQUIRE(getData()[0] == 10);
    }

    SECTION("print()") {
        nitori::hijack_stdout();

        clear();
        append(10);
        append(11);
        append(12);
        append(13);
        print();

        REQUIRE(nitori::stdout() == "10, 11, 12, 13");
    }

    SECTION("squeeze()") {
        clear();
        reserve(100);
        squeeze();

        REQUIRE(getCapacity() == 0);

        clear();
        reserve(100);
        for(size_t i = 0; i < 50; i++) append(i);
        squeeze();

        REQUIRE(getCapacity() == 50);
    }

    SECTION("append(int*, size_t)") {
        clear();
        int arr[] = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90};
        append(arr, 10);
        for(size_t i = 0; i < 10; i++) REQUIRE(getData()[i] == arr[i]);
    }

    SECTION("insert(int, int)") {
        clear();
        int arr[] = {0, 1, 2, 3, /*4, */5, 6, 7, 8, 9};
        append(arr, 9);

        insert(4, 4);
        for(size_t i = 0; i < 10; i++) REQUIRE(getData()[i] == i);
    }

    SECTION("erase(int)") {
        clear();
        int arr1[] = {0, 1, 2, 3, 4,     5, 6, 7, 8, 9};
        int arr2[] = {0, 1, 2, 3, /*4, */5, 6, 7, 8, 9};

        append(arr1, 10);
        erase(4);

        for(size_t i = 0; i < 9; i++) REQUIRE(getData()[i] == arr2[i]);
    }

    SECTION("indexOf(int*, int)") {
        clear();
        int arr[] = {0, 10, 20, 30, 40, 50, 60, 70, 80, 90};
        append(arr, 10);

        REQUIRE(indexOf(100) == -1);
        REQUIRE(indexOf(0) == 0);
        REQUIRE(indexOf(10) == 1);
        REQUIRE(indexOf(50) == 5);
    }
}