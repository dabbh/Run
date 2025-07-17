#!/usr/bin/env python3
# Test file for Python execution

def main():
    print("Hello from Python!")
    print("Testing Python script execution.")
    
    # Basic math operations
    a, b = 5, 3
    print(f"{a} + {b} = {a + b}")
    print(f"{a} * {b} = {a * b}")
    
    # List operations
    numbers = [1, 2, 3, 4, 5]
    print(f"Sum of {numbers} = {sum(numbers)}")
    
    # String operations
    name = "VS Code Extension"
    print(f"Testing {name} - Success!")

if __name__ == "__main__":
    main()
