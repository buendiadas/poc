/* solium-disable security/no-inline-assembly */
pragma solidity ^0.6.3;

contract Doppelganger {
    struct MockCall {
        bool initialized;
        bool reverts;
        string revertsReason;
        bytes returnValue;
    }

    mapping(bytes32 => MockCall) mockConfig;

    fallback() external payable {
        MockCall storage mockCall = __doppelganger__internal__getMockCall();
        if (mockCall.reverts == true) {
            revert(
                string(
                    abi.encodePacked("Mock revert: ", mockCall.revertsReason)
                )
            );
        }

        __doppelganger__internal__mockReturn(mockCall.returnValue);
    }

    function __doppelganger__mockReverts(
        bytes memory data,
        string memory reason
    ) public {
        mockConfig[keccak256(data)] = MockCall({
            initialized: true,
            reverts: true,
            revertsReason: reason,
            returnValue: ""
        });
    }

    function __doppelganger__mockReturns(bytes memory data, bytes memory value)
        public
    {
        mockConfig[keccak256(data)] = MockCall({
            initialized: true,
            reverts: false,
            revertsReason: "",
            returnValue: value
        });
    }

    function __doppelganger__internal__toHexDigit(uint8 d)
        internal
        pure
        returns (bytes1)
    {
        if (0 <= d && d <= 9) {
            return bytes1(uint8(bytes1("0")) + d);
        } else if (10 <= uint8(d) && uint8(d) <= 15) {
            return bytes1(uint8(bytes1("a")) + d - 10);
        }
        revert();
    }

    function __doppelganger__internal__fromCode(bytes4 code)
        internal
        view
        returns (string memory)
    {
        bytes memory result = new bytes(10);
        result[0] = bytes1("0");
        result[1] = bytes1("x");
        for (uint256 i = 0; i < 4; ++i) {
            result[2 * i + 2] = __doppelganger__internal__toHexDigit(
                uint8(code[i]) / 16
            );
            result[2 * i + 3] = __doppelganger__internal__toHexDigit(
                uint8(code[i]) % 16
            );
        }
        return string(result);
    }

    function __doppelganger__internal__getMockCall()
        private
        view
        returns (MockCall storage mockCall)
    {
        mockCall = mockConfig[keccak256(msg.data)];
        if (mockCall.initialized == true) {
            // Mock method with specified arguments
            return mockCall;
        }
        mockCall = mockConfig[keccak256(abi.encodePacked(msg.sig))];
        if (mockCall.initialized == true) {
            // Mock method with any arguments
            return mockCall;
        }
        revert(
            string(
                abi.encodePacked(
                    "Mock on the method is not initialized: ",
                    __doppelganger__internal__fromCode(msg.sig)
                )
            )
        );
    }

    function __doppelganger__internal__mockReturn(bytes memory ret)
        private
        pure
    {
        assembly {
            return(add(ret, 0x20), mload(ret))
        }
    }
}
