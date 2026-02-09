#ifndef CG_PICTURE_H
#define CG_PICTURE_H
#include "lib/core/core.h"

#include <SFML/Graphics/RectangleShape.hpp>

class Picture
	: public core::Drawable
	, public core::Locatable
	, public core::Draggable
{
public:
	explicit Picture(const sf::Vector2f& position, const sf::Vector2f& bounds)
		: Locatable(position)
		, m_bounds(bounds)
	{
	}

	void Draw(sf::RenderTarget& target, sf::RenderStates states) override
	{
		sf::RectangleShape rect(m_bounds);
		rect.setPosition(Position());
		rect.setFillColor(sf::Color::Black);

		target.draw(rect);
	}

	void OnMouseDown(sf::Vector2f mousePosition) override
	{
		if (IsInside(mousePosition))
		{
			m_isDragging = true;
			m_delta = Position() - mousePosition;
		}
	}

	void OnMouseUp(sf::Vector2f mousePosition) override
	{
		m_isDragging = false;
	}

	void OnMouseMove(sf::Vector2f mousePosition) override
	{
		if (m_isDragging)
		{
			SetPosition(mousePosition + m_delta);
		}
	}

private:
	[[nodiscard]] bool IsInside(sf::Vector2f point) const
	{
		return point.x >= Position().x && point.x <= Position().x + m_bounds.x
			&& point.y >= Position().y && point.y <= Position().y + m_bounds.y;
	}

	sf::Vector2f m_bounds{};
	sf::Vector2f m_delta{};
	bool m_isDragging = false;
};

#endif // CG_PICTURE_H
