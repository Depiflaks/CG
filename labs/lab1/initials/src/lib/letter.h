//
// Created by smmm on 2/10/26.
//

#ifndef CG_LETTER_H
#define CG_LETTER_H
#include "core/core.h"

class Letter
	: public core::Drawable
	, public core::Kinematic
{
public:
	Letter(const sf::Vector2f& position, const sf::Vector2f& speed,
		const sf::Vector2f& acceleration)
		: Kinematic(position, speed, acceleration)
	{
	}

private:
	sf::Vector2f m_bounds;
};

#endif // CG_LETTER_H
